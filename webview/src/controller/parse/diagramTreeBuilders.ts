import type {
  AppliesStyleEdge,
  ClassNode,
  DiagramTree,
  InNamespaceEdge,
  NamespaceNode,
  RelationshipEdge,
  StyleDefNode,
} from "../primitives";
import { buildAppliesStyleEdge } from "./builders/buildAppliesStyleEdge";
import { buildClassNode } from "./builders/buildClassNode";
import { buildInNamespaceEdges } from "./builders/buildInNamespaceEdge";
import { buildNamespaceNode } from "./builders/buildNamespaceNode";
import { buildRelationshipEdge } from "./builders/buildRelationshipEdge";
import { buildSpatialData, type MalformedAnnotation, type SpatialEntry } from "./builders/buildSpatialData";
import { buildStyleDefNode } from "./builders/buildStyleDefNode";
import type { ParseToken } from "./tokenizer";

export type SpatialAnnotationParseResult = {
  readonly valid: SpatialEntry[];
  readonly malformed: MalformedAnnotation[];
};

type MutableDiagramTree = {
  readonly classes: Map<ClassNode["id"], ClassNode>;
  readonly styleDefs: Map<StyleDefNode["id"], StyleDefNode>;
  readonly namespaces: Map<NamespaceNode["id"], NamespaceNode>;
  readonly relationships: RelationshipEdge[];
  readonly appliesStyleEdges: AppliesStyleEdge[];
  readonly inNamespaceEdges: InNamespaceEdge[];
};

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

export function parseSpatialAnnotations(tokens: ParseToken[]): SpatialAnnotationParseResult {
  const valid: SpatialEntry[] = [];
  const malformed: MalformedAnnotation[] = [];

  traverseSpatialTokens(tokens, valid, malformed);

  return { valid, malformed };
}

export function attachSpatial(tree: DiagramTree, valid: readonly SpatialEntry[]): DiagramTree {
  const spatialByClassId = new Map(valid.map((entry) => [entry.classId, entry.spatial]));
  const classes = new Map(tree.classes);

  for (const [id, node] of classes) {
    const spatial = spatialByClassId.get(node.id);
    if (spatial) classes.set(id, { ...node, spatial });
  }

  return { ...tree, classes };
}

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
