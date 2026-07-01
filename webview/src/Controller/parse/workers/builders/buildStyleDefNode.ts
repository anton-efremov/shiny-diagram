/**
 * @fileoverview Builds style definition nodes from classDef tokens.
 */

import { toStyleDefId } from "../../../../shared/ids";
import { STYLE_PROPERTIES } from "../../../../shared/style";
import type { StyleDefNode, StyleProperty } from "../../../model/diagramTree";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "../toSourceLocation";

/**
 * Builds a style definition node from a classDef token.
 */
export function buildStyleDefNode(token: ParseToken): StyleDefNode | null {
  if (token.type !== "styleDef") return null;

  const match = /^\s*classDef\s+(\w+)\s+(.+)$/.exec(token.raw);
  if (!match) return null;

  return {
    kind: "styleDef",
    id: toStyleDefId(match[1]),
    properties: parseStyleProperties(match[2]),
    location: toSourceLocation(token),
  };
}

function parseStyleProperties(propertiesStr: string): StyleProperty[] {
  const properties: StyleProperty[] = [];

  for (const part of propertiesStr.split(",")) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;

    const key = part.slice(0, colonIdx).trim();
    const value = part.slice(colonIdx + 1).trim();

    const property = STYLE_PROPERTIES.find(
      (styleProperty) => styleProperty.name === key || styleProperty.source === key
    );
    if (property) properties.push({ property: property.name, value });
  }

  return properties;
}
