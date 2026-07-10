/**
 * @behavior Style definition rename transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";
import type { DeclaredStyleView } from "../../../../../views/schema";

export function toStyleNameSetTransaction(
  style: DeclaredStyleView,
  name: string
): EditorCommandTransaction {
  return [{ type: "style.definition.name.set", styleDefId: style.styleDefId, name }];
}
