/**
 * @framework React Flow endpoint geometry to the shared flexible edge path.
 */

import { getBezierPath, type Position } from "@xyflow/react";

type FlexibleEdgeGeometry = {
  readonly sourceX: number;
  readonly sourceY: number;
  readonly sourcePosition: Position;
  readonly targetX: number;
  readonly targetY: number;
  readonly targetPosition: Position;
};

export function getFlexibleEdgePath(
  geometry: FlexibleEdgeGeometry
): ReturnType<typeof getBezierPath> {
  return getBezierPath(geometry);
}
