/**
 * @fileoverview Builds a class diagram tree from tokenizer output.
 * Performs a single top-level traversal and delegates token-specific work
 * to focused builder functions.
 */

import type { TreeEdge, TreeNode } from "../../models/classDiagram/diagramTreeModel";
import type { TreeNodeId } from "../../models/classDiagram/primitives";
import { buildAppliesStyleEdge } from "./builders/buildAppliesStyleEdge";
import { buildClassNode } from "./builders/buildClassNode";
import { buildRelationshipEdge } from "./builders/buildRelationshipEdge";
import {
  buildSpatialData,
  type MalformedAnnotation,
  type SpatialEntry,
} from "./builders/buildSpatialData";
import { buildStyleDefNode } from "./builders/buildStyleDefNode";
import type { ParseToken } from "./tokenizer";

export type DiagramTreeBuildResult = {
  readonly nodes: Map<TreeNodeId, TreeNode>;
  readonly edges: TreeEdge[];
  readonly spatialEntries: SpatialEntry[];
  readonly malformedAnnotations: MalformedAnnotation[];
};

/**
 * Builds diagram tree collections from class diagram parse tokens.
 */
export function buildDiagramTree(tokens: ParseToken[]): DiagramTreeBuildResult {
  const nodes = new Map<TreeNodeId, TreeNode>();
  const edges: TreeEdge[] = [];
  const spatialEntries: SpatialEntry[] = [];
  const malformedAnnotations: MalformedAnnotation[] = [];

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
      case "spatialAnnotation": {
        collectSpatialResult(token, spatialEntries, malformedAnnotations);
        break;
      }
      case "namespace": {
        // Sprint 2: recurse into token.blockTokens to build NamespaceNode
        // and InNamespaceEdges. Stubbed for now.
        break;
      }
    }

    // Legacy Generate runs could place @spatial lines inside class bodies.
    // Preserve that tolerance while namespace traversal remains stubbed.
    if (token.blockTokens) {
      for (const child of token.blockTokens) {
        if (child.type === "spatialAnnotation") {
          collectSpatialResult(child, spatialEntries, malformedAnnotations);
        }
      }
    }
  }

  return { nodes, edges, spatialEntries, malformedAnnotations };
}

function collectSpatialResult(
  token: ParseToken,
  spatialEntries: SpatialEntry[],
  malformedAnnotations: MalformedAnnotation[]
): void {
  const result = buildSpatialData(token);
  if (!result) return;

  if ("spatial" in result) {
    spatialEntries.push(result);
  } else {
    malformedAnnotations.push(result);
  }
}
