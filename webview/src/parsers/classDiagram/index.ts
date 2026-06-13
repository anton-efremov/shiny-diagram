/**
 * @fileoverview Public API for the Mermaid class diagram parser.
 * Orchestrates the tokenizer and rule functions to produce a DiagramTree
 * from raw Mermaid source. Pure function — no React, no VS Code dependencies.
 */

import type { ClassNode, DiagramTree } from "../../models/classDiagram/diagramTreeModel";
import { buildDiagramTree } from "./diagramTreeBuilder";
import type { ParseResult } from "./parseResult";
import { tokenize } from "./tokenizer";

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

    const tokens = tokenize(source);

    const {
      nodes,
      edges,
      spatialEntries,
      malformedAnnotations: malformedAnnotationEntries,
    } = buildDiagramTree(tokens);

    const spatialByClassId = new Map(spatialEntries.map((entry) => [entry.classId, entry.spatial]));

    for (const [id, node] of nodes) {
      if (node.kind !== "class") continue;
      const spatial = spatialByClassId.get(node.id);
      if (spatial) {
        nodes.set(id, { ...node, spatial });
      }
    }

    const model: DiagramTree = { nodes, edges };

    const missingIds = [...nodes.values()]
      .filter((node): node is ClassNode => node.kind === "class")
      .filter((node) => !node.spatial)
      .map((node) => node.id);
    if (missingIds.length > 0) {
      const malformedAnnotations = new Map(
        malformedAnnotationEntries.map((entry) => [entry.classId, entry.location])
      );
      return { ok: false, error: "missingAnnotations", missingIds, model, malformedAnnotations };
    }

    return { ok: true, model };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown parse error";
    return { ok: false, error: "invalidSyntax", message };
  }
}
