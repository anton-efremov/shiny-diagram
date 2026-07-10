/**
 * @behavior Named style property transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";
import type { DeclaredStyleView } from "../../../../../views/schema";
import type { StylePropertyName } from "../../../../../../shared/style";

export function toStylePropertySetTransaction(
  style: DeclaredStyleView,
  property: StylePropertyName,
  value: string | null
): EditorCommandTransaction {
  return [{ type: "style.definition.property.set", styleDefId: style.styleDefId, property, value }];
}
