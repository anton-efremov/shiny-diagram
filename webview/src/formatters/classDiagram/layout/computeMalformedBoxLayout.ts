/**
 * @fileoverview Layout for classes with a malformed (incomplete) @spatial
 * annotation. Currently identical to computeNewBoxLayout — grid-placed in row
 * order, discarding any partial x/y/w/h the malformed annotation had.
 *
 * Future: preserve whichever of x/y/w/h were successfully parsed from the
 * malformed annotation, filling only the missing fields via gridPlacement.
 */

import { readClassBoxMetrics } from "./classBoxMetrics";
import { gridPlacement, type GridPosition } from "./gridPlacement";

export function computeMalformedBoxLayout(index: number, startY: number): GridPosition {
  return gridPlacement(index, startY, readClassBoxMetrics());
}
