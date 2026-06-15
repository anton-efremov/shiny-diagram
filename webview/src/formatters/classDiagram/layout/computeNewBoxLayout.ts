/**
 * @fileoverview Layout for classes with no @spatial annotation at all.
 * Currently identical to gridPlacement — grid-placed in row order.
 */

import { readClassBoxMetrics } from "./classBoxMetrics";
import { gridPlacement, type GridPosition } from "./gridPlacement";

export function computeNewBoxLayout(index: number, startY: number): GridPosition {
  return gridPlacement(index, startY, readClassBoxMetrics());
}
