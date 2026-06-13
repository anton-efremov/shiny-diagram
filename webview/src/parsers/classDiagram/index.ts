/**
 * @fileoverview Public API for the Mermaid class diagram parser.
 * Orchestrates the tokenizer and rule functions to produce a DiagramTree
 * from raw Mermaid source. Pure function — no React, no VS Code dependencies.
 */

import type {
  ClassNode,
  DiagramTree,
  TreeEdge,
  TreeNode,
} from "../../models/classDiagram/diagramTreeModel";
import type { TreeNodeId } from "../../models/classDiagram/primitives";
import type { ParseResult } from "./parseResult";
import { tokenize } from "./tokenizer";
import { parseClasses } from "./rules/parseClasses";
import { parseRelationships } from "./rules/parseRelationships";
import { parseStyles } from "./rules/parseStyles";
import { parseSpatial } from "./rules/parseSpatial";

/**
 * Returns true if the source begins with a `classDiagram` declaration,
 * ignoring leading blank lines and comment lines.
 */
function hasClassDiagramHeader(source: string): boolean {
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("%%")) continue;
    return trimmed === "classDiagram" || trimmed.startsWith("classDiagram ");
  }
  return false;
}

/**
 * Parses a Mermaid class diagram source string into a ParseResult.
 * Returns an invalidSyntax error if the source does not begin with
 * `classDiagram`. Returns a missingAnnotations error if any class lacks
 * a @spatial annotation (the partial model is included for auto-placement).
 * Returns ok on full success.
 *
 * @param source - Full .mmd file content.
 * @returns ParseResult discriminated union.
 */
export function parseDiagram(source: string): ParseResult {
  try {
    if (!hasClassDiagramHeader(source)) {
      return {
        ok: false,
        error: "invalidSyntax",
        message: "Source must begin with 'classDiagram'",
      };
    }

    const lines = tokenize(source);

    const { nodes: classNodes, appliesStyleEdges } = parseClasses(lines);
    const relationships = parseRelationships(lines);
    const styleDefs = parseStyles(lines);
    const { valid: spatialList, malformed: malformedList } = parseSpatial(lines);

    const spatialByClassId = new Map(spatialList.map((entry) => [entry.classId, entry.spatial]));
    const nodes = new Map<TreeNodeId, TreeNode>();

    for (const classNode of classNodes) {
      const spatial = spatialByClassId.get(classNode.id);
      const node: ClassNode = spatial ? { ...classNode, spatial } : classNode;
      nodes.set(node.id, node);
    }

    for (const styleDef of styleDefs) {
      nodes.set(styleDef.id, styleDef);
    }

    const edges: TreeEdge[] = [...relationships, ...appliesStyleEdges];
    const model: DiagramTree = { nodes, edges };

    const missingIds = [...nodes.values()]
      .filter((node): node is ClassNode => node.kind === "class")
      .filter((node) => !node.spatial)
      .map((node) => node.id);
    if (missingIds.length > 0) {
      const malformedAnnotations = new Map(malformedList.map((m) => [m.classId, m.location]));
      return { ok: false, error: "missingAnnotations", missingIds, model, malformedAnnotations };
    }

    return { ok: true, model };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown parse error";
    return { ok: false, error: "invalidSyntax", message };
  }
}
