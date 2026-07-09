/**
 * @behavior Named style deletion transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../commands/editorCommands";
import type { StyleView } from "../../../../views/schema";

export function toStyleDeleteTransaction(style: StyleView): EditorCommandTransaction {
  return [{ type: "style.definition.delete", styleDefId: style.styleId }];
}
