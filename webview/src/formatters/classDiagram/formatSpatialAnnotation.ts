/**
 * @fileoverview Formats Shiny spatial annotation lines from structured data.
 * Mirror of buildSpatialData.ts — where the builder reads annotations, this
 * module writes them.
 */

/**
 * Builds a spatial annotation line for the given class, position, and size.
 * Coordinates are rounded to whole pixels.
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
