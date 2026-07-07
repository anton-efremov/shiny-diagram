/**
 * @fileoverview Relationship source-identity composition shared by Controller components:
 * Parse composes the ID when building relationship edges; Translate composes the
 * post-transaction ID when reporting identity outcomes.
 */

import type { ClassId, RelationshipId } from "../../shared/ids";

/**
 * Composes a relationship identifier from its endpoint classes and its ordinal —
 * the index of the relationship statement in document order (a global counter
 * across all relationship statements).
 *
 * Single definition point of the relationship-identity shape; no other code may
 * construct or parse the `${source}--${target}--${ordinal}` form.
 */
export function composeRelationshipId(
  sourceClassId: ClassId,
  targetClassId: ClassId,
  ordinal: number
): RelationshipId {
  return `${sourceClassId}--${targetClassId}--${ordinal}` as RelationshipId;
}
