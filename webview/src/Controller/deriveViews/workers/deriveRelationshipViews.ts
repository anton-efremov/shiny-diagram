/**
 * @fileoverview Derives View-owned relationship render models from Controller relationship edges.
 */

import type { DiagramGraph, RelationshipEdge } from "../../model/diagramGraph";
import type { RelationshipView } from "../../../View/views";
import type { RelationshipType } from "../../../shared/uml";

/**
 * Derives relationship views whose endpoints both have spatial data.
 */
export function deriveRelationshipViews(model: DiagramGraph): RelationshipView[] {
  return [...model.relationships.values()].flatMap((rel) => {
    const source = model.classes.get(rel.source.classId);
    const target = model.classes.get(rel.target.classId);
    if (!source?.spatial || !target?.spatial) return [];

    return [
      {
        relationshipId: rel.id,
        sourceClassId: rel.source.classId,
        targetClassId: rel.target.classId,
        relationType: toRelationshipType(rel),
        sourceMultiplicity: rel.source.multiplicity ?? undefined,
        targetMultiplicity: rel.target.multiplicity ?? undefined,
        label: rel.label ?? undefined,
      },
    ];
  });
}

function toRelationshipType(relationship: RelationshipEdge): RelationshipType {
  if (
    relationship.source.endpointKind === "triangle" &&
    relationship.target.endpointKind === "triangle" &&
    relationship.lineKind === "solid"
  ) {
    return "twoWay";
  }
  if (relationship.source.endpointKind === "triangle" && relationship.lineKind === "solid") {
    return "inheritance";
  }
  if (relationship.target.endpointKind === "triangle" && relationship.lineKind === "dashed") {
    return "realization";
  }
  if (relationship.target.endpointKind === "arrow" && relationship.lineKind === "solid") {
    return "association";
  }
  if (relationship.target.endpointKind === "arrow" && relationship.lineKind === "dashed") {
    return "dependency";
  }
  if (relationship.source.endpointKind === "composition" && relationship.lineKind === "solid") {
    return "composition";
  }
  if (relationship.source.endpointKind === "aggregation" && relationship.lineKind === "solid") {
    return "aggregation";
  }
  return relationship.lineKind === "dashed" ? "dashedLink" : "solidLink";
}
