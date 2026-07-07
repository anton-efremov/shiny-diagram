/**
 * @framework React Flow class-box node geometry to a View diagram point snapped
 * to the hovered box's connection points.
 */

import type { Node as ReactFlowNode } from "@xyflow/react";
import type { Point, Rect } from "../../../../../../shared/geometry";

// Framework prop and event adaptation
/**
 * Snaps a diagram-space point to the nearest border point of the class box
 * under it; returns the point unchanged over empty canvas.
 */
export function toSnappedDiagramPoint(point: Point, nodes: readonly ReactFlowNode[]): Point {
  const boxes = toClassBoxRects(nodes);
  const hoveredBoxes = boxes.filter((box) => containsPoint(box, point));
  if (hoveredBoxes.length === 0) return point;

  return hoveredBoxes
    .map((box) => toNearestBorderPoint(box, point))
    .reduce((nearest, candidate) =>
      squaredDistance(candidate, point) < squaredDistance(nearest, point) ? candidate : nearest
    );
}

// Private helpers
function toClassBoxRects(nodes: readonly ReactFlowNode[]): Rect[] {
  return nodes.flatMap((node) => {
    if (node.type !== "classBox") return [];
    const w = node.measured?.width ?? node.width;
    const h = node.measured?.height ?? node.height;
    if (w === undefined || h === undefined) return [];
    return [{ x: node.position.x, y: node.position.y, w, h }];
  });
}

function containsPoint(box: Rect, point: Point): boolean {
  return (
    point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h
  );
}

function toNearestBorderPoint(box: Rect, point: Point): Point {
  const distanceToLeft = point.x - box.x;
  const distanceToRight = box.x + box.w - point.x;
  const distanceToTop = point.y - box.y;
  const distanceToBottom = box.y + box.h - point.y;
  const nearestDistance = Math.min(
    distanceToLeft,
    distanceToRight,
    distanceToTop,
    distanceToBottom
  );

  if (nearestDistance === distanceToLeft) return { x: box.x, y: point.y };
  if (nearestDistance === distanceToRight) return { x: box.x + box.w, y: point.y };
  if (nearestDistance === distanceToTop) return { x: point.x, y: box.y };
  return { x: point.x, y: box.y + box.h };
}

function squaredDistance(left: Point, right: Point): number {
  return (left.x - right.x) ** 2 + (left.y - right.y) ** 2;
}
