/**
 * @fileoverview Formats complete Mermaid source lines emitted by command handlers.
 */

import type { StyleDefNode, StyleProperty } from "../../model/diagramTree";

/**
 * Formats a complete Shiny spatial annotation line.
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
 * Formats a complete classDef line with one property updated.
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
