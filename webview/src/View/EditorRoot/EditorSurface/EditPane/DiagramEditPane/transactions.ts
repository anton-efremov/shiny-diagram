/**
 * @behavior Diagram style creation, property editing, and deletion transaction derivation.
 */

import type { StyleProperties, StylePropertyName } from "../../../../../shared/style";
import type { EditorCommandTransaction } from "../../../../commands/editorCommands";
import type { DeclaredStyleView } from "../../../../views/schema";

const INITIAL_STYLE: StyleProperties = {
  fill: "#ffffff",
  stroke: null,
  strokeWidth: null,
  strokeDasharray: null,
  color: null,
};

export function toStyleCreateTransaction(
  styles: readonly DeclaredStyleView[]
): EditorCommandTransaction {
  return [
    {
      type: "style.definition.create",
      name: toUniqueStyleName(styles),
      sourceKind: "classDef",
      properties: INITIAL_STYLE,
      applyToClassIds: [],
    },
  ];
}

export function toStyleDeleteTransaction(style: DeclaredStyleView): EditorCommandTransaction {
  return [{ type: "style.definition.delete", styleDefId: style.styleDefId }];
}

export function toStylePropertySetTransaction(
  style: DeclaredStyleView,
  property: StylePropertyName,
  value: string | null
): EditorCommandTransaction {
  return [{ type: "style.definition.property.set", styleDefId: style.styleDefId, property, value }];
}

// Private helpers
function toUniqueStyleName(styles: readonly DeclaredStyleView[]): string {
  const names = new Set(styles.map((styleView) => styleView.name));
  let index = 1;
  while (names.has(`style${index}`)) index += 1;
  return `style${index}`;
}
