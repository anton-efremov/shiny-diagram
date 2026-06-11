/**
 * @fileoverview Formats Shiny spatial annotation lines from structured data.
 * Mirror of parseSpatial.ts — where parseSpatial reads annotations, this
 * module writes them. Used by the drag handler to produce replacement text
 * for the diff patcher without touching the rest of the source.
 */

import type { SpatialAnnotation } from "./diagramModel";

/**
 * Rebuilds a spatial annotation line with updated x/y coordinates.
 * Preserves the existing width and height from the annotation.
 * Coordinates are rounded to whole pixels.
 *
 * @param annotation - Current annotation providing classId, w, and h.
 * @param x - New horizontal position in canvas units.
 * @param y - New vertical position in canvas units.
 * @returns Complete replacement line text, without a trailing newline.
 */
export function formatSpatialAnnotation(
  annotation: SpatialAnnotation,
  x: number,
  y: number
): string {
  const rx = Math.round(x);
  const ry = Math.round(y);
  return `%% @spatial:${annotation.classId} x=${rx} y=${ry} w=${annotation.width} h=${annotation.height}`;
}
