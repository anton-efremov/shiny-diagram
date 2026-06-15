/**
 * @fileoverview Formats Mermaid classDef lines for style property edits.
 * Preserves existing classDef properties while replacing the requested one.
 */

import type { StyleDefNode, StyleProperty } from "../../models/classDiagram/diagramTreeModel";

/**
 * Rebuilds a classDef line with an updated property value.
 *
 * @param style - Current style definition with source location.
 * @param property - Which property to set (fill, stroke, color, etc.)
 * @param value - New value for that property.
 * @returns Complete replacement classDef line text, without a trailing newline.
 */
export function formatStyleDefProperty(
  style: StyleDefNode,
  property: StyleProperty["property"],
  value: string
): string {
  const match = /^(\s*classDef\s+\w+\s+)(.*)$/.exec(style.location.raw);
  if (!match) {
    return `classDef ${style.id} ${property}:${value}`;
  }

  const prefix = match[1];
  const properties = match[2]
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const index = properties.findIndex((p) => p.split(":", 1)[0].trim() === property);

  if (index === -1) {
    properties.push(`${property}:${value}`);
  } else {
    properties[index] = `${property}:${value}`;
  }

  return `${prefix}${properties.join(",")}`;
}
