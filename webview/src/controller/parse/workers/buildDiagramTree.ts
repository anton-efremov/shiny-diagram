/**
 * @fileoverview Builds the Controller diagram model from parser tokens.
 */

import type {
  AppliesStyleEdge,
  ClassNode,
  DiagramTree,
  InNamespaceEdge,
  NamespaceNode,
  RelationshipEdge,
  StyleDefNode,
} from "../../model/diagramTree";
import { buildAppliesStyleEdge } from "./builders/buildAppliesStyleEdge";
import { buildClassNode } from "./builders/buildClassNode";
import { buildInNamespaceEdges } from "./builders/buildInNamespaceEdge";
import { buildNamespaceNode } from "./builders/buildNamespaceNode";
import { buildRelationshipEdge } from "./builders/buildRelationshipEdge";
import { buildStyleDefNode } from "./builders/buildStyleDefNode";
import type { ParseToken } from "./tokenizer";

type MutableDiagramTree = {
  readonly classes: Map<ClassNode["id"], ClassNode>;
  readonly styleDefs: Map<StyleDefNode["id"], StyleDefNode>;
  readonly namespaces: Map<NamespaceNode["id"], NamespaceNode>;
  readonly relationships: RelationshipEdge[];
  readonly appliesStyleEdges: AppliesStyleEdge[];
  readonly inNamespaceEdges: InNamespaceEdge[];
};

/**
 * Builds diagram nodes and edges without applying spatial annotations.
 */
export function buildSpatiallyUnawareDiagramTree(tokens: ParseToken[]): DiagramTree {
  const tree: MutableDiagramTree = {
    classes: new Map(),
    styleDefs: new Map(),
    namespaces: new Map(),
    relationships: [],
    appliesStyleEdges: [],
    inNamespaceEdges: [],
  };

  traverseTokens(tokens, tree);

  return tree;
}

/**
 * Adds implicit class nodes for undeclared relationship endpoints.
 */
export function synthesizeImplicitClassNodes(tree: DiagramTree): DiagramTree {
  const classes = new Map(tree.classes);

  for (const relationship of tree.relationships) {
    for (const id of [relationship.source, relationship.target]) {
      if (!classes.has(id)) {
        classes.set(id, { kind: "class", id, members: [], location: null });
      }
    }
  }

  return { ...tree, classes };
}

function traverseTokens(tokens: readonly ParseToken[], tree: MutableDiagramTree): void {
  for (const token of tokens) {
    switch (token.type) {
      case "classDeclaration": {
        const node = buildClassNode(token);
        if (node) tree.classes.set(node.id, node);
        break;
      }
      case "styleApplication": {
        const edge = buildAppliesStyleEdge(token);
        if (edge) tree.appliesStyleEdges.push(edge);
        break;
      }
      case "styleDef": {
        const node = buildStyleDefNode(token);
        if (node) tree.styleDefs.set(node.id, node);
        break;
      }
      case "relationship": {
        const edge = buildRelationshipEdge(token);
        if (edge) tree.relationships.push(edge);
        break;
      }
      case "namespace": {
        const node = buildNamespaceNode(token);
        if (node) tree.namespaces.set(node.id, node);
        tree.inNamespaceEdges.push(...buildInNamespaceEdges(token));
        break;
      }
    }

    if (token.blockTokens) {
      traverseTokens(token.blockTokens, tree);
    }
  }
}
