/**
 * @fileoverview Selects placement for generated spatial annotations.
 */

import { gridPlacement, type GridPosition } from "./gridPlacement";

/**
 * Computes placement for a generated class annotation.
 */
export function computeGeneratedBoxLayout(index: number, startY: number): GridPosition {
  return gridPlacement(index, startY);
}
