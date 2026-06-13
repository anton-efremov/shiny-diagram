/**
 * @fileoverview Extracts classDef style definitions from tokenized Mermaid source.
 * Parses comma-separated property:value pairs into typed style properties.
 */

import type {
  SourceLocation,
  StyleDefNode,
  StyleProperty,
} from "../../../models/classDiagram/diagramTreeModel";
import { toStyleDefId } from "../../../models/classDiagram/primitives";
import type { TokenizedLine } from "../tokenizer";

/**
 * Extracts all classDef declarations from the tokenized source.
 * Unknown or unsupported property keys are silently ignored.
 *
 * @param lines - Flat tokenized line sequence from the tokenizer.
 * @returns Array of StyleDefNode values with source locations.
 */
export function parseStyles(lines: TokenizedLine[]): StyleDefNode[] {
  const result: StyleDefNode[] = [];

  for (const line of lines) {
    if (line.type !== "styleDef") continue;

    const match = /^\s*classDef\s+(\w+)\s+(.+)$/.exec(line.raw);
    if (!match) continue;

    const name = match[1];
    const properties = parseStyleProperties(match[2]);

    result.push({
      kind: "styleDef",
      id: toStyleDefId(name),
      properties,
      location: toSourceLocation(line),
    });
  }

  return result;
}

/**
 * Parses a comma-separated Mermaid style property string into style properties.
 * Handles both hyphenated Mermaid names (stroke-width) and camelCase variants.
 */
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

function toSourceLocation(line: TokenizedLine): SourceLocation {
  return {
    startLine: line.lineNumber,
    startChar: 0,
    endLine: line.lineNumber,
    endChar: line.raw.length,
    raw: line.raw,
  };
}
