/**
 * @framework React Flow endpoint geometry to completed and floating flexible edge paths.
 */

import { getBezierPath, Position } from "@xyflow/react";

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

type FloatingTargetGeometry = {
  readonly sourceX: number;
  readonly sourceY: number;
  readonly targetX: number;
  readonly targetY: number;
};

export function getFloatingTargetPosition({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: FloatingTargetGeometry): Position {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? Position.Left : Position.Right;
  return dy >= 0 ? Position.Top : Position.Bottom;
}
