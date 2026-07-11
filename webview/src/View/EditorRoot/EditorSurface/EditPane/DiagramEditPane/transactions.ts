/**
 * @behavior Diagram style creation, property editing, base copying, reset, and deletion transaction derivation.
 */

import type { StyleProperties, StylePropertyName } from "../../../../../shared/style";
import type { EditorCommandTransaction } from "../../../../commands/editorCommands";
import type { BaseStyleView, DeclaredStyleView } from "../../../../views/schema";

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

export function toStylePropertySetTransaction(
  style: DeclaredStyleView,
  property: StylePropertyName,
  value: string | null
): EditorCommandTransaction {
  return [{ type: "style.definition.property.set", styleDefId: style.styleDefId, property, value }];
}

export function toBaseStylePropertySetTransaction(
  materializedBase: DeclaredStyleView | undefined,
  baseStyle: BaseStyleView,
  property: StylePropertyName,
  value: string | null
): EditorCommandTransaction {
  if (!materializedBase) {
    if (value === null) return [];
    return [
      {
        type: "style.definition.create",
        name: "default",
        sourceKind: "classDef",
        properties: {
          fill: null,
          stroke: null,
          strokeWidth: null,
          strokeDasharray: null,
          color: null,
          [property]: value,
        },
        applyToClassIds: [],
      },
    ];
  }
  if (value === null && baseStyle[property] !== undefined && Object.keys(baseStyle).length === 1) {
    return [{ type: "style.definition.delete", styleDefId: materializedBase.styleDefId }];
  }
  return [
    {
      type: "style.definition.property.set",
      styleDefId: materializedBase.styleDefId,
      property,
      value,
    },
  ];
}

// Private helpers
function toUniqueStyleName(styles: readonly DeclaredStyleView[]): string {
  const names = new Set(styles.map((styleView) => styleView.name));
  let index = 1;
  while (names.has(`style${index}`)) index += 1;
  return `style${index}`;
}
