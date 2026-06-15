/**
 * @fileoverview Formats single source lines from structured diagram tree data.
 * Write-side mirrors of the parser's builders — where a builder reads a line
 * into structured data, the corresponding format function here writes it back.
 */

import type { StyleDefNode, StyleProperty } from "../../models/classDiagram/diagramTreeModel";

/**
 * Builds a spatial annotation line for the given class, position, and size.
 * Mirror of buildSpatialData.ts. Coordinates are rounded to whole pixels.
 */
export function formatSpatialAnnotation(
  classId: string,
  x: number,
  y: number,
  width: number,
  height: number
): string {
  const rx = Math.round(x);
  const ry = Math.round(y);
  return `%% @spatial:${classId} x=${rx} y=${ry} w=${width} h=${height}`;
}

/**
 * Rebuilds a classDef line with an updated property value.
 * Mirror of buildStyleDefNode.ts. Preserves existing classDef properties while
 * replacing the requested one.
 *
 * @param style - Current style definition with source location.
 * @param property - Which property to set (fill, stroke, color, etc.)
 * @param value - New value for that property.
 * @returns Complete replacement classDef line text, without a trailing newline.
 */
export function formatStyleProperty(
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
