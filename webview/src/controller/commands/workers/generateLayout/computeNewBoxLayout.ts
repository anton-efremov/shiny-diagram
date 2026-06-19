/**
 * @fileoverview Selects placement for classes without spatial annotations.
 */

import { gridPlacement, type GridPosition } from "./gridPlacement";

/**
 * Computes placement for a class without a spatial annotation.
 */
export function computeNewBoxLayout(index: number, startY: number): GridPosition {
  return gridPlacement(index, startY);
}
