/**
 * @fileoverview Extracts classDef style definitions from tokenized Mermaid source.
 * Parses comma-separated property:value pairs into typed StyleDef fields.
 */

import type { StyleDef } from "../diagramModel";
import type { TokenizedLine } from "../tokenizer";

/**
 * Extracts all classDef declarations from the tokenized source.
 * Unknown or unsupported property keys are silently ignored.
 *
 * @param lines - Flat tokenized line sequence from the tokenizer.
 * @returns Array of StyleDef values with source locations.
 */
export function parseStyles(lines: TokenizedLine[]): StyleDef[] {
  const result: StyleDef[] = [];

  for (const line of lines) {
    if (line.type !== "styleDef") continue;

    const match = /^\s*classDef\s+(\w+)\s+(.+)$/.exec(line.raw);
    if (!match) continue;

    const name = match[1];
    const props = parseStyleProperties(match[2]);

    result.push({
      name,
      ...props,
      location: { line: line.lineNumber, raw: line.raw },
    });
  }

  return result;
}

type StyleProps = {
  fill?: string;
  stroke?: string;
  color?: string;
  strokeWidth?: string;
  strokeDasharray?: string;
};

/**
 * Parses a comma-separated Mermaid style property string into named fields.
 * Handles both hyphenated Mermaid names (stroke-width) and camelCase variants.
 */
function parseStyleProperties(propertiesStr: string): StyleProps {
  const props: StyleProps = {};

  for (const part of propertiesStr.split(",")) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;

    const key = part.slice(0, colonIdx).trim();
    const value = part.slice(colonIdx + 1).trim();

    switch (key) {
      case "fill":
        props.fill = value;
        break;
      case "stroke":
        props.stroke = value;
        break;
      case "color":
        props.color = value;
        break;
      case "stroke-width":
      case "strokeWidth":
        props.strokeWidth = value;
        break;
      case "stroke-dasharray":
      case "strokeDasharray":
        props.strokeDasharray = value;
        break;
    }
  }

  return props;
}
