/**
 * @fileoverview Builds a class diagram tree from tokenizer output.
 * Performs a recursive traversal and delegates token-specific work
 * to focused builder functions.
 *
 * spatial annotations are valid at any nesting level — top level, inside
 * class bodies, or inside namespace blocks. The recursive traversal handles
 * all cases uniformly without special-casing.
 */

import type { DiagramTree, TreeEdge, TreeNode } from "../../models/classDiagram/diagramTreeModel";
import type { TreeNodeId } from "../../models/classDiagram/primitives";
import { buildAppliesStyleEdge } from "./builders/buildAppliesStyleEdge";
import { buildClassNode } from "./builders/buildClassNode";
import { buildInNamespaceEdges } from "./builders/buildInNamespaceEdge";
import { buildNamespaceNode } from "./builders/buildNamespaceNode";
import { buildRelationshipEdge } from "./builders/buildRelationshipEdge";
import {
  buildSpatialData,
  type MalformedAnnotation,
  type SpatialEntry,
} from "./builders/buildSpatialData";
import { buildStyleDefNode } from "./builders/buildStyleDefNode";
import type { ParseToken } from "./tokenizer";

export type SpatialAnnotationParseResult = {
  readonly valid: SpatialEntry[];
  readonly malformed: MalformedAnnotation[];
};

/**
 * Builds a diagram tree from class diagram parse tokens without spatial data.
 * Recurses into block tokens so all nesting levels are traversed.
 */
export function buildSpatiallyUnawareDiagramTree(tokens: ParseToken[]): DiagramTree {
  const nodes = new Map<TreeNodeId, TreeNode>();
  const edges: TreeEdge[] = [];

  traverseTokens(tokens, nodes, edges);

  return { nodes, edges };
}

/**
 * Extracts valid and malformed spatial annotations from parse tokens.
 */
export function parseSpatialAnnotations(tokens: ParseToken[]): SpatialAnnotationParseResult {
  const valid: SpatialEntry[] = [];
  const malformed: MalformedAnnotation[] = [];

  traverseSpatialTokens(tokens, valid, malformed);

  return { valid, malformed };
}

/**
 * Attaches spatial data to matching class nodes.
 */
export function attachSpatial(tree: DiagramTree, valid: readonly SpatialEntry[]): DiagramTree {
  const spatialByClassId = new Map(valid.map((entry) => [entry.classId, entry.spatial]));
  const nodes = new Map<TreeNodeId, TreeNode>(tree.nodes);

  for (const [id, node] of nodes) {
    if (node.kind !== "class") continue;
    const spatial = spatialByClassId.get(node.id);
    if (spatial) {
      nodes.set(id, { ...node, spatial });
    }
  }

  return { nodes, edges: tree.edges };
}

function traverseTokens(
  tokens: readonly ParseToken[],
  nodes: Map<TreeNodeId, TreeNode>,
  edges: TreeEdge[]
): void {
  for (const token of tokens) {
    switch (token.type) {
      case "classDeclaration": {
        const node = buildClassNode(token);
        if (node) nodes.set(node.id, node);
        break;
      }
      case "styleApplication": {
        const edge = buildAppliesStyleEdge(token);
        if (edge) edges.push(edge);
        break;
      }
      case "styleDef": {
        const node = buildStyleDefNode(token);
        if (node) nodes.set(node.id, node);
        break;
      }
      case "relationship": {
        const edge = buildRelationshipEdge(token);
        if (edge) edges.push(edge);
        break;
      }
      case "namespace": {
        const node = buildNamespaceNode(token);
        if (node) nodes.set(node.id, node);
        edges.push(...buildInNamespaceEdges(token));
        break;
      }
    }

    if (token.blockTokens) {
      traverseTokens(token.blockTokens, nodes, edges);
    }
  }
}

function traverseSpatialTokens(
  tokens: readonly ParseToken[],
  valid: SpatialEntry[],
  malformed: MalformedAnnotation[]
): void {
  for (const token of tokens) {
    if (token.type === "spatialAnnotation") {
      collectSpatialResult(token, valid, malformed);
    }

    if (token.blockTokens) {
      traverseSpatialTokens(token.blockTokens, valid, malformed);
    }
  }
}

function collectSpatialResult(
  token: ParseToken,
  valid: SpatialEntry[],
  malformed: MalformedAnnotation[]
): void {
  const spatial = buildSpatialData(token);
  if (!spatial) return;

  if ("spatial" in spatial) {
    valid.push(spatial);
  } else {
    malformed.push(spatial);
  }
}
