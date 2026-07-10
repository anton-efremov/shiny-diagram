/**
 * @behavior Named style property transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";
import type { StyleView } from "../../../../../views/schema";
import type { StylePropertyName } from "../../../../../../shared/style";

export function toStylePropertySetTransaction(
  style: StyleView,
  property: StylePropertyName,
  value: string | null
): EditorCommandTransaction {
  return [{ type: "style.definition.property.set", styleDefId: style.styleId, property, value }];
}
