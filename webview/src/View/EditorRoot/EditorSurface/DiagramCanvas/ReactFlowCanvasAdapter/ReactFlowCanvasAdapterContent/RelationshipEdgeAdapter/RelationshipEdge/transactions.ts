/**
 * @behavior Relationship inline edit transaction derivation.
 */

import type { RelationshipId } from "../../../../../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../../../../../commands/editorCommands";

export function toRelationshipLabelSetTransaction(
  relationshipId: RelationshipId,
  label: string | null
): EditorCommandTransaction {
  return [{ type: "relationship.label.set", relationshipId, label }];
}

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
