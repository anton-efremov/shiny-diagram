/**
 * @behavior Relationship multiplicity edit transaction derivation.
 */

import type { RelationshipId } from "../../../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";

export function toRelationshipMultiplicitySetTransaction(
  relationshipId: RelationshipId,
  side: "source" | "target",
  multiplicity: string | null
): EditorCommandTransaction {
  return [
    side === "source"
      ? { type: "relationship.source.multiplicity.set", relationshipId, multiplicity }
      : { type: "relationship.target.multiplicity.set", relationshipId, multiplicity },
  ];
}
