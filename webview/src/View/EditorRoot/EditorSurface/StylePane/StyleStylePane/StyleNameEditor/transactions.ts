/**
 * @behavior Style definition rename transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";
import type { StyleView } from "../../../../../views/schema";

export function toStyleNameSetTransaction(
  style: StyleView,
  name: string
): EditorCommandTransaction {
  return [{ type: "style.definition.name.set", styleDefId: style.styleId, name }];
}
