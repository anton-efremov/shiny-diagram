/**
 * @fileoverview Selects replacement placement for malformed spatial annotations.
 */

import { gridPlacement, type GridPosition } from "./gridPlacement";

/**
 * Computes placement for replacing a malformed spatial annotation.
 */
export function computeMalformedBoxLayout(index: number, startY: number): GridPosition {
  return gridPlacement(index, startY);
}
