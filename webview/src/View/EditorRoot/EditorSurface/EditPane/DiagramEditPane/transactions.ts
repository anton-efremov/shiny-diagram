/**
 * @behavior Diagram style creation, default-copy, and deletion transaction derivation.
 */

import type { StyleProperties } from "../../../../../shared/style";
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

export function toDefaultStyleSetTransaction(
  style: DeclaredStyleView,
  defaultStyle: DeclaredStyleView | undefined
): EditorCommandTransaction {
  if (!defaultStyle) {
    return [
      {
        type: "style.definition.create",
        name: "default",
        sourceKind: "classDef",
        properties: style.properties,
        applyToClassIds: [],
      },
    ];
  }
  return Object.entries(style.properties).map(([property, value]) => ({
    type: "style.definition.property.set" as const,
    styleDefId: defaultStyle.styleDefId,
    property: property as keyof StyleProperties,
    value,
  }));
}

export function toStyleDeleteTransaction(style: DeclaredStyleView): EditorCommandTransaction {
  return [{ type: "style.definition.delete", styleDefId: style.styleDefId }];
}

// Private helpers
function toUniqueStyleName(styles: readonly DeclaredStyleView[]): string {
  const names = new Set(styles.map((styleView) => styleView.name));
  let index = 1;
  while (names.has(`style${index}`)) index += 1;
  return `style${index}`;
}
