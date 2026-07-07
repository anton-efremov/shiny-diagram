/**
 * @fileoverview Relationship id prediction utilities for View reselection flows.
 *
 * The durable fix is exposing the ordinal on RelationshipView; until then this is
 * the sole coupling point to the relationship id shape.
 */

import { toRelationshipId, type ClassId, type RelationshipId } from "../../shared/ids";

export function toPredictedRelationshipId(
  currentId: RelationshipId,
  newSourceClassId: ClassId,
  newTargetClassId: ClassId
): RelationshipId {
  const indexStart = currentId.lastIndexOf("--");
  const index = indexStart === -1 ? "0" : currentId.slice(indexStart + 2);
  // Shiny: mirrors buildRelationshipEdge id derivation `${source}--${target}--${index}`.
  return toRelationshipId(`${newSourceClassId}--${newTargetClassId}--${index}`);
}
