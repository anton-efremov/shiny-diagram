/**
 * @fileoverview Builds style definition nodes from classDef tokens.
 */

import { toStyleDefId } from "../../../../shared/ids";
import { STYLE_PROPERTIES } from "../../../../shared/style";
import type { StyleProperties } from "../../../../shared/style";
import type { StyleDefNode } from "../../../model/diagramGraph";
import type { SourceSpan } from "../../../model/sourceEdit";
import type { ParseToken } from "../tokenizer";
import { toSourceSpan } from "../toSourceSpan";

export type ParsedStyleDefNode = {
  readonly node: StyleDefNode;
  readonly location: SourceSpan;
};

/**
 * Builds a style definition node from a classDef token.
 */
export function buildStyleDefNode(token: ParseToken): ParsedStyleDefNode | null {
  if (token.type !== "styleDef") return null;

  const match = /^\s*classDef\s+(\w+)\s+(.+)$/.exec(token.raw);
  if (!match) return null;

  const id = toStyleDefId(match[1]);
  return {
    location: toSourceSpan(token),
    node: {
      kind: "styleDef",
      id,
      name: id,
      sourceKind: "classDef",
      properties: parseStyleProperties(match[2]),
    },
  };
}

function parseStyleProperties(propertiesStr: string): StyleProperties {
  const properties: Record<keyof StyleProperties, string | null> = {
    fill: null,
    stroke: null,
    strokeWidth: null,
    strokeDasharray: null,
    color: null,
  };

  for (const part of propertiesStr.split(",")) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;

    const key = part.slice(0, colonIdx).trim();
    const value = part.slice(colonIdx + 1).trim();

    const property = STYLE_PROPERTIES.find(
      (styleProperty) => styleProperty.name === key || styleProperty.source === key
    );
    if (property) properties[property.name] = value;
  }

  return properties;
}
