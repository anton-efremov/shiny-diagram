import type { SpatialData } from "../../primitives";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT, MARGIN } from "./layoutConstants";

export type GridPosition = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export function computeStartY(existingSpatial: readonly SpatialData[]): number {
  let maxBottom = 0;
  for (const spatial of existingSpatial) {
    const bottom = spatial.y + spatial.height;
    if (bottom > maxBottom) maxBottom = bottom;
  }
  return maxBottom > 0 ? maxBottom + MARGIN : MARGIN;
}

export function gridPlacement(index: number, startY: number): GridPosition {
  const x = MARGIN + index * (DEFAULT_WIDTH + MARGIN);
  return { x, y: startY, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
}
