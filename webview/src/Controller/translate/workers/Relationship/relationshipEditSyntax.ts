/**
 * @fileoverview Shared helpers for relationship edit translate workers.
 */

import type { RelationshipId } from "../../../../shared/ids";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../../../shared/uml";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { WriteIntent } from "../../writeIntent";
import { composeRelationshipOperator } from "./relationshipSyntax";

export function replaceRelationshipOperator(
  relationshipId: RelationshipId,
  graph: DiagramGraph,
  patch: Partial<{
    readonly sourceEndpointKind: RelationshipEndpointKind;
    readonly targetEndpointKind: RelationshipEndpointKind;
    readonly lineKind: RelationshipLineKind;
  }>
): WriteIntent[] {
  const relationship = graph.relationships.get(relationshipId);
  if (!relationship) return [];
  const operator = composeRelationshipOperator({
    sourceEndpointKind: patch.sourceEndpointKind ?? relationship.source.endpointKind,
    targetEndpointKind: patch.targetEndpointKind ?? relationship.target.endpointKind,
    lineKind: patch.lineKind ?? relationship.lineKind,
  });
  return [
    {
      kind: "replaceValue",
      target: { kind: "relationshipOperator", relationshipId },
      payload: operator,
    },
  ];
}

export function replaceRelationshipMultiplicity(
  relationshipId: RelationshipId,
  side: "source" | "target",
  multiplicity: string
): WriteIntent[] {
  return [
    {
      kind: "replaceValue",
      target: { kind: "relationshipMultiplicity", relationshipId, side },
      payload: multiplicity,
    },
  ];
}
