/**
 * @behavior Relationship delete transaction derivation.
 */

import type { RelationshipId } from "../../../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";

export function toRelationshipDeleteTransaction(
  relationshipId: RelationshipId
): EditorCommandTransaction {
  return [{ type: "relationship.delete", relationshipId }];
}
