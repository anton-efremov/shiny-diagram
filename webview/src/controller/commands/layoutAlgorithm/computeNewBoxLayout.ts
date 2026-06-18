import { gridPlacement, type GridPosition } from "./gridPlacement";

export function computeNewBoxLayout(index: number, startY: number): GridPosition {
  return gridPlacement(index, startY);
}
