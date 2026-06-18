import { gridPlacement, type GridPosition } from "./gridPlacement";

export function computeMalformedBoxLayout(index: number, startY: number): GridPosition {
  return gridPlacement(index, startY);
}
