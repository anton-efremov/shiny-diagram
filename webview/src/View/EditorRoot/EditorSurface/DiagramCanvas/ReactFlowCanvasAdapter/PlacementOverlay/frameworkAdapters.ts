/**
 * @framework React Flow canvas coordinates to View diagram coordinates.
 */

import type { Point } from "../../../../../../shared/geometry";

// Framework-domain command adaptation
export function toDiagramPoint(flowPoint: Point): Point {
  return flowPoint;
}
