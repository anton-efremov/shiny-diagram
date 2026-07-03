/**
 * @fileoverview Spells Mermaid style entries.
 */

import { STYLE_PROPERTIES, type StylePropertyName } from "../../../shared/style";

export function composeStyleEntry(property: StylePropertyName, value: string): string {
  return `${toSourcePropertyName(property)}:${value}`;
}

export function toSourcePropertyName(property: StylePropertyName): string {
  return (
    STYLE_PROPERTIES.find((styleProperty) => styleProperty.name === property)?.source ?? property
  );
}
