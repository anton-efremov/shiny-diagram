import type { StyleDefNode, StyleProperty } from "../../../primitives";
import { toStyleDefId } from "../../../primitives";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "./toSourceLocation";

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

    switch (key) {
      case "fill":
        properties.push({ property: "fill", value });
        break;
      case "stroke":
        properties.push({ property: "stroke", value });
        break;
      case "color":
        properties.push({ property: "color", value });
        break;
      case "stroke-width":
      case "strokeWidth":
        properties.push({ property: "strokeWidth", value });
        break;
      case "stroke-dasharray":
      case "strokeDasharray":
        properties.push({ property: "strokeDasharray", value });
        break;
    }
  }

  return properties;
}
