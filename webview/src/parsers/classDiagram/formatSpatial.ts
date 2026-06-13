/**
 * @fileoverview Formats Shiny spatial annotation lines from structured data.
 * Mirror of buildSpatialData.ts — where the builder reads annotations, this
 * module writes them. Used by the drag handler to produce replacement text
 * for the diff patcher without touching the rest of the source.
 */

import type { SpatialData } from "../../models/classDiagram/diagramTreeModel";

/**
 * Rebuilds a spatial annotation line with updated x/y coordinates.
 * Preserves the existing width and height from the annotation.
 * Coordinates are rounded to whole pixels.
 *
 * @param spatial - Current annotation providing w and h.
 * @param classId - Class id used to reconstruct the annotation key.
 * @param x - New horizontal position in canvas units.
 * @param y - New vertical position in canvas units.
 * @returns Complete replacement line text, without a trailing newline.
 */
export function formatSpatialAnnotation(
  spatial: SpatialData,
  classId: string,
  x: number,
  y: number
): string {
  const rx = Math.round(x);
  const ry = Math.round(y);
  return `%% @spatial:${classId} x=${rx} y=${ry} w=${spatial.width} h=${spatial.height}`;
}
