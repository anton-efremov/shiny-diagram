/**
 * @fileoverview Adapts the current DiagramTree parser output into DiagramGraph scaffolding.
 */

import type { StyleProperties } from "../../shared/style";
import { toAttributeId, toDiagramId, toMethodId, toStyleApplicationId } from "../../shared/ids";
import type {
  RelationshipEndpointKind,
  RelationshipLineKind,
  RelationshipType,
} from "../../shared/uml";
import type { DiagramTree, ClassMember, SpatialData, StyleProperty } from "./diagramTree";
import type {
  ClassAttribute,
  ClassMethod,
  ClassNode,
  DiagramGraph,
  RelationshipEdge,
  StyleApplicationEdge,
  StyleDefNode,
} from "./diagramGraph";
import type { ProvenanceIndex } from "./provenanceIndex";
import type { SourceLocation } from "./sourceLocation";

export type DiagramGraphAdapterResult = {
  readonly graph: DiagramGraph;
  readonly provenance: ProvenanceIndex;
};

export function adaptDiagramTreeToGraph(model: DiagramTree): DiagramGraphAdapterResult {
  const provenance = toProvenanceIndex(model);
  const parentNamespaceByClassId = new Map(
    model.inNamespaceEdges.map((edge) => [edge.source, edge.target] as const)
  );

  return {
    graph: {
      diagram: {
        kind: "classDiagram",
        id: toDiagramId("classDiagram"),
        direction: null,
        config: {
          hideEmptyMembersBox: null,
          hierarchicalNamespaces: null,
        },
      },
      classes: new Map(
        [...model.classes.entries()].map(([classId, node]) => [
          classId,
          {
            kind: "class",
            id: classId,
            name: classId,
            label: classId,
            genericType: null,
            annotation: node.annotation?.value ?? null,
            parentNamespaceId: parentNamespaceByClassId.get(classId) ?? null,
            spatial: node.spatial ? toSpatialAttachment(node.spatial) : null,
            attributes: node.members.flatMap(toClassAttribute),
            methods: node.members.flatMap(toClassMethod),
            // TODO(writeback-step): parser does not produce lollipop interface collections yet.
            lollipopInterfaces: [],
            directStyle: null,
            interaction: null,
          } satisfies ClassNode,
        ])
      ),
      namespaces: new Map(
        [...model.namespaces.keys()].map((namespaceId) => [
          namespaceId,
          {
            kind: "namespace",
            id: namespaceId,
            name: namespaceId,
            label: namespaceId,
            parentNamespaceId: null,
            // TODO(writeback-step): parser does not produce namespace spatial annotations yet.
            spatial: null,
          },
        ])
      ),
      relationships: new Map(model.relationships.map((edge) => [edge.id, toRelationship(edge)])),
      // TODO(writeback-step): parser does not produce first-class notes yet.
      notes: new Map(),
      styleDefinitions: new Map(
        [...model.styleDefs.entries()].map(([styleDefId, node]) => [
          styleDefId,
          {
            kind: "styleDef",
            id: styleDefId,
            name: styleDefId,
            sourceKind: "classDef",
            properties: toStyleProperties(node.properties),
          } satisfies StyleDefNode,
        ])
      ),
      styleApplications: new Map(
        model.appliesStyleEdges.map((edge, index) => {
          const id = toStyleApplicationIdForEdge(edge.source, edge.target, index);
          const graphEdge: StyleApplicationEdge = {
            kind: "styleApplication",
            id,
            targetId: edge.source,
            styleDefId: edge.target,
          };
          return [id, graphEdge] as const;
        })
      ),
    },
    provenance,
  };
}

function toProvenanceIndex(model: DiagramTree): ProvenanceIndex {
  return {
    classes: new Map(
      [...model.classes.entries()].flatMap(([classId, node]) =>
        node.location ? [[classId, node.location] as const] : []
      )
    ),
    members: new Map(
      [...model.classes.values()].flatMap((node) =>
        node.members.map((member) => [member.id, member.location] as const)
      )
    ),
    namespaces: new Map(
      [...model.namespaces.entries()].map(([namespaceId, node]) => [namespaceId, node.location])
    ),
    styleDefinitions: new Map(
      [...model.styleDefs.entries()].map(([styleDefId, node]) => [styleDefId, node.location])
    ),
    relationships: new Map(model.relationships.map((edge) => [edge.id, edge.location])),
    classSpatial: new Map(
      [...model.classes.entries()].flatMap(([classId, node]) =>
        node.spatial ? [[classId, node.spatial.location] as const] : []
      )
    ),
    namespaceMemberships: new Map(
      model.inNamespaceEdges.map((edge) => [edge.source, edge.location])
    ),
    styleApplications: new Map(
      model.appliesStyleEdges.map((edge, index) => [
        toStyleApplicationIdForEdge(edge.source, edge.target, index),
        edge.location,
      ])
    ),
  };
}

function toStyleApplicationIdForEdge(
  source: string,
  target: string,
  index: number
): StyleApplicationEdge["id"] {
  return toStyleApplicationId(`${source}:::${target}:${index}`);
}

function toSpatialAttachment(spatial: SpatialData) {
  return {
    position: { x: spatial.x, y: spatial.y },
    size: { width: spatial.width, height: spatial.height },
  };
}

function toClassAttribute(member: ClassMember): readonly ClassAttribute[] {
  if (member.kind !== "field") return [];
  return [
    {
      id: toAttributeId(member.id),
      name: member.name,
      visibility: member.visibility,
      attributeType: member.fieldType ?? null,
      isStatic: false,
    },
  ];
}

function toClassMethod(member: ClassMember): readonly ClassMethod[] {
  if (member.kind !== "method") return [];
  return [
    {
      id: toMethodId(member.id),
      name: member.name,
      visibility: member.visibility,
      parameters: member.params ?? "",
      returnType: member.returnType ?? null,
      isStatic: false,
      isAbstract: false,
    },
  ];
}

function toRelationship(edge: {
  readonly id: RelationshipEdge["id"];
  readonly source: RelationshipEdge["source"]["classId"];
  readonly target: RelationshipEdge["target"]["classId"];
  readonly type: RelationshipType;
  readonly label?: string;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly location: SourceLocation;
}): RelationshipEdge {
  const shape = toRelationshipShape(edge.type);
  return {
    kind: "relationship",
    id: edge.id,
    source: {
      classId: edge.source,
      multiplicity: edge.sourceMultiplicity ?? null,
      endpointKind: shape.sourceKind,
    },
    target: {
      classId: edge.target,
      multiplicity: edge.targetMultiplicity ?? null,
      endpointKind: shape.targetKind,
    },
    lineKind: shape.lineKind,
    label: edge.label ?? null,
  };
}

function toRelationshipShape(type: RelationshipType): {
  readonly sourceKind: RelationshipEndpointKind;
  readonly targetKind: RelationshipEndpointKind;
  readonly lineKind: RelationshipLineKind;
} {
  switch (type) {
    case "association":
      return { sourceKind: "none", targetKind: "arrow", lineKind: "solid" };
    case "dependency":
      return { sourceKind: "none", targetKind: "arrow", lineKind: "dashed" };
    case "inheritance":
      return { sourceKind: "triangle", targetKind: "none", lineKind: "solid" };
    case "realization":
      return { sourceKind: "none", targetKind: "triangle", lineKind: "dashed" };
    case "composition":
      return { sourceKind: "composition", targetKind: "none", lineKind: "solid" };
    case "aggregation":
      return { sourceKind: "aggregation", targetKind: "none", lineKind: "solid" };
    case "twoWay":
      return { sourceKind: "triangle", targetKind: "triangle", lineKind: "solid" };
    case "dashedLink":
      return { sourceKind: "none", targetKind: "none", lineKind: "dashed" };
    case "solidLink":
    case "lollipop":
      return { sourceKind: "none", targetKind: "none", lineKind: "solid" };
  }
}

function toStyleProperties(properties: readonly StyleProperty[]): StyleProperties {
  return {
    fill: properties.find((property) => property.property === "fill")?.value ?? null,
    stroke: properties.find((property) => property.property === "stroke")?.value ?? null,
    strokeWidth: properties.find((property) => property.property === "strokeWidth")?.value ?? null,
    fontSize: properties.find((property) => property.property === "fontSize")?.value ?? null,
  };
}
