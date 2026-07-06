/**
 * @behavior Relationship label edit transaction derivation.
 */

import type { RelationshipId } from "../../../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";

export function toRelationshipLabelSetTransaction(
  relationshipId: RelationshipId,
  label: string | null
): EditorCommandTransaction {
  return [{ type: "relationship.label.set", relationshipId, label }];
}
