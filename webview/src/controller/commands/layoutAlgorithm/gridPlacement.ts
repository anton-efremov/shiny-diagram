import type { SpatialData } from "../../model/diagramTreeModel";
import type { ClassBoxMetrics } from "../commandTypes";

export type { ClassBoxMetrics };

export type GridPosition = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export function computeStartY(existingSpatial: readonly SpatialData[], margin: number): number {
  let maxBottom = 0;
  for (const spatial of existingSpatial) {
    const bottom = spatial.y + spatial.height;
    if (bottom > maxBottom) maxBottom = bottom;
  }
  return maxBottom > 0 ? maxBottom + margin : margin;
}

export function gridPlacement(index: number, startY: number, metrics: ClassBoxMetrics): GridPosition {
  const x = metrics.margin + index * (metrics.defaultWidth + metrics.margin);
  return { x, y: startY, width: metrics.defaultWidth, height: metrics.defaultHeight };
}
