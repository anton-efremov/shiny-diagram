import type { ClassBoxMetrics } from "../commandTypes";
import { gridPlacement, type GridPosition } from "./gridPlacement";

export function computeMalformedBoxLayout(
  index: number,
  startY: number,
  metrics: ClassBoxMetrics
): GridPosition {
  return gridPlacement(index, startY, metrics);
}
