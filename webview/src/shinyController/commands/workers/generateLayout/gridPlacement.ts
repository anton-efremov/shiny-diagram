/**
 * @fileoverview Computes default grid positions for generated class annotations.
 */

import type { SpatialData } from "../../../model/diagramTree";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT, MARGIN } from "./layoutConstants";

export type GridPosition = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/**
 * Computes the first generated row below existing spatial annotations.
 */
export function computeStartY(existingSpatial: readonly SpatialData[]): number {
  let maxBottom = 0;
  for (const spatial of existingSpatial) {
    const bottom = spatial.y + spatial.height;
    if (bottom > maxBottom) maxBottom = bottom;
  }
  return maxBottom > 0 ? maxBottom + MARGIN : MARGIN;
}

/**
 * Computes a grid position for a generated class annotation.
 */
export function gridPlacement(index: number, startY: number): GridPosition {
  const x = MARGIN + index * (DEFAULT_WIDTH + MARGIN);
  return { x, y: startY, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
}
