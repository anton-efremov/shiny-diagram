/**
 * @fileoverview Spells Mermaid style entries.
 */

import {
  STYLE_PROPERTIES,
  type StyleProperties,
  type StylePropertyName,
} from "../../../shared/style";

export function composeStyleEntry(property: StylePropertyName, value: string): string {
  return `${toSourcePropertyName(property)}:${value}`;
}

export function composeStyleEntries(properties: StyleProperties): string {
  return STYLE_PROPERTIES.flatMap(({ name }) => {
    const value = properties[name];
    return value === null ? [] : [composeStyleEntry(name, value)];
  }).join(",");
}

export function toSourcePropertyName(property: StylePropertyName): string {
  return (
    STYLE_PROPERTIES.find((styleProperty) => styleProperty.name === property)?.source ?? property
  );
}
