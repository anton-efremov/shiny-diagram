/**
 * @fileoverview Builds the Controller diagram graph and provenance index from parser tokens.
 */

import { toDiagramId } from "../../../shared/ids";
import type {
  ClassNode,
  DiagramGraph,
  NamespaceNode,
  RelationshipEdge,
  StyleApplicationEdge,
  StyleDefNode,
} from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndexOld";
import type { SourceLocation } from "../../model/sourceLocation";
import { buildAppliesStyleEdge } from "./builders/buildAppliesStyleEdge";
import { buildClassNode } from "./builders/buildClassNode";
import { buildInNamespaceEdges, type InNamespaceEdge } from "./builders/buildInNamespaceEdge";
import { buildNamespaceNode } from "./builders/buildNamespaceNode";
import { buildRelationshipEdge } from "./builders/buildRelationshipEdge";
import { buildStyleDefNode } from "./builders/buildStyleDefNode";
import type { ParseToken } from "./tokenizer";

type MutableGraphBuild = {
  readonly classes: Map<ClassNode["id"], ClassNode>;
  readonly styleDefinitions: Map<StyleDefNode["id"], StyleDefNode>;
  readonly namespaces: Map<NamespaceNode["id"], NamespaceNode>;
  readonly relationships: Map<RelationshipEdge["id"], RelationshipEdge>;
  readonly styleApplications: Map<StyleApplicationEdge["id"], StyleApplicationEdge>;
  readonly inNamespaceEdges: InNamespaceEdge[];
  readonly provenance: {
    readonly classes: Map<ClassNode["id"], SourceLocation>;
    readonly members: Map<
      ClassNode["attributes"][number]["id"] | ClassNode["methods"][number]["id"],
      SourceLocation
    >;
    readonly namespaces: Map<NamespaceNode["id"], SourceLocation>;
    readonly styleDefinitions: Map<StyleDefNode["id"], SourceLocation>;
    readonly relationships: Map<RelationshipEdge["id"], SourceLocation>;
    readonly classSpatial: Map<ClassNode["id"], SourceLocation>;
    readonly namespaceMemberships: Map<ClassNode["id"], SourceLocation>;
    readonly styleApplications: Map<StyleApplicationEdge["id"], SourceLocation>;
  };
};

export type GraphBuildResult = {
  readonly graph: DiagramGraph;
  readonly provenance: ProvenanceIndex;
};

export function buildSpatiallyUnawareDiagramGraph(tokens: ParseToken[]): GraphBuildResult {
  const build: MutableGraphBuild = {
    classes: new Map(),
    styleDefinitions: new Map(),
    namespaces: new Map(),
    relationships: new Map(),
    styleApplications: new Map(),
    inNamespaceEdges: [],
    provenance: {
      classes: new Map(),
      members: new Map(),
      namespaces: new Map(),
      styleDefinitions: new Map(),
      relationships: new Map(),
      classSpatial: new Map(),
      namespaceMemberships: new Map(),
      styleApplications: new Map(),
    },
  };

  traverseTokens(tokens, build);
  synthesizeImplicitClassNodes(build);
  attachNamespaceMembership(build);

  return {
    graph: toDiagramGraph(build),
    provenance: build.provenance,
  };
}

function traverseTokens(tokens: readonly ParseToken[], build: MutableGraphBuild): void {
  for (const token of tokens) {
    switch (token.type) {
      case "classDeclaration": {
        const parsed = buildClassNode(token);
        if (parsed) {
          build.classes.set(parsed.node.id, parsed.node);
          build.provenance.classes.set(parsed.node.id, parsed.location);
          for (const [memberId, location] of parsed.memberLocations) {
            build.provenance.members.set(memberId, location);
          }
        }
        break;
      }
      case "styleApplication": {
        const parsed = buildAppliesStyleEdge(token, build.styleApplications.size);
        if (parsed) {
          build.styleApplications.set(parsed.edge.id, parsed.edge);
          build.provenance.styleApplications.set(parsed.edge.id, parsed.location);
        }
        break;
      }
      case "styleDef": {
        const parsed = buildStyleDefNode(token);
        if (parsed) {
          build.styleDefinitions.set(parsed.node.id, parsed.node);
          build.provenance.styleDefinitions.set(parsed.node.id, parsed.location);
        }
        break;
      }
      case "relationship": {
        const parsed = buildRelationshipEdge(token, build.relationships.size);
        if (parsed) {
          build.relationships.set(parsed.edge.id, parsed.edge);
          build.provenance.relationships.set(parsed.edge.id, parsed.location);
        }
        break;
      }
      case "namespace": {
        const parsed = buildNamespaceNode(token);
        if (parsed) {
          build.namespaces.set(parsed.node.id, parsed.node);
          build.provenance.namespaces.set(parsed.node.id, parsed.location);
        }
        build.inNamespaceEdges.push(...buildInNamespaceEdges(token));
        break;
      }
    }

    if (token.blockTokens) {
      traverseTokens(token.blockTokens, build);
    }
  }
}

function synthesizeImplicitClassNodes(build: MutableGraphBuild): void {
  for (const relationship of build.relationships.values()) {
    for (const id of [relationship.source.classId, relationship.target.classId]) {
      if (!build.classes.has(id)) {
        build.classes.set(id, toImplicitClassNode(id));
      }
    }
  }
}

function attachNamespaceMembership(build: MutableGraphBuild): void {
  for (const edge of build.inNamespaceEdges) {
    const node = build.classes.get(edge.source);
    if (!node) continue;
    build.classes.set(edge.source, { ...node, parentNamespaceId: edge.target });
    build.provenance.namespaceMemberships.set(edge.source, edge.location);
  }
}

function toImplicitClassNode(id: ClassNode["id"]): ClassNode {
  return {
    kind: "class",
    id,
    name: id,
    label: id,
    genericType: null,
    annotation: null,
    parentNamespaceId: null,
    spatial: null,
    attributes: [],
    methods: [],
    lollipopInterfaces: [],
    directStyle: null,
    interaction: null,
  };
}

function toDiagramGraph(build: MutableGraphBuild): DiagramGraph {
  return {
    diagram: {
      kind: "classDiagram",
      id: toDiagramId("classDiagram"),
      direction: null,
      config: {
        hideEmptyMembersBox: null,
        hierarchicalNamespaces: null,
      },
    },
    classes: build.classes,
    namespaces: build.namespaces,
    relationships: build.relationships,
    notes: new Map(),
    styleDefinitions: build.styleDefinitions,
    styleApplications: build.styleApplications,
  };
}
