/**
 * @fileoverview Formats Mermaid classDef lines for style edits.
 * Preserves existing classDef properties while replacing the requested fill.
 */

import type { StyleDefNode } from "../../models/classDiagram/diagramTreeModel";

/**
 * Rebuilds a classDef line with an updated fill property.
 *
 * @param style - Current style definition with source location.
 * @param fill - New Mermaid fill color value.
 * @returns Complete replacement classDef line text, without a trailing newline.
 */
export function formatStyleDefFill(style: StyleDefNode, fill: string): string {
  const match = /^(\s*classDef\s+\w+\s+)(.*)$/.exec(style.location.raw);
  if (!match) {
    return `classDef ${style.id} fill:${fill}`;
  }

  const prefix = match[1];
  const properties = match[2]
    .split(",")
    .map((property) => property.trim())
    .filter((property) => property.length > 0);

  const fillIndex = properties.findIndex((property) => property.split(":", 1)[0].trim() === "fill");

  if (fillIndex === -1) {
    properties.push(`fill:${fill}`);
  } else {
    properties[fillIndex] = `fill:${fill}`;
  }

  return `${prefix}${properties.join(",")}`;
}
