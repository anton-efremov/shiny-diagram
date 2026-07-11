/**
 * @behavior Namespace inline-name commit transaction derivation.
 */

import type { NamespaceId } from "../../../../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../../../../commands/editorCommands";

export function toNamespaceNameCommitTransaction(
  namespaceId: NamespaceId,
  name: string
): EditorCommandTransaction {
  return [{ type: "namespace.name.set", namespaceId, name }];
}
