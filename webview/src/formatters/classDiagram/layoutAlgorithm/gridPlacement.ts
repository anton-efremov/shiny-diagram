/**
 * @fileoverview Grid placement primitive — lays out boxes in a single row,
 * left to right, below all existing boxes. Used by computeNewBoxLayout and
 * computeMalformedBoxLayout. Pure math, no DOM access beyond the metrics passed in.
 */

import type { SpatialData } from "../../../models/classDiagram/diagramTreeModel";
import type { ClassBoxMetrics } from "./classBoxMetrics";

export type GridPosition = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/**
 * Computes the y-coordinate for a new row of boxes: below the bottom edge of
 * all existing boxes plus a margin, or just the margin if none exist.
 */
export function computeStartY(existingSpatial: readonly SpatialData[], margin: number): number {
  let maxBottom = 0;
  for (const spatial of existingSpatial) {
    const bottom = spatial.y + spatial.height;
    if (bottom > maxBottom) maxBottom = bottom;
  }
  return maxBottom > 0 ? maxBottom + margin : margin;
}

/**
 * Places the box at `index` in a left-to-right row starting at `startY`.
 */
export function gridPlacement(
  index: number,
  startY: number,
  metrics: ClassBoxMetrics
): GridPosition {
  const x = metrics.margin + index * (metrics.defaultWidth + metrics.margin);
  return { x, y: startY, width: metrics.defaultWidth, height: metrics.defaultHeight };
}
