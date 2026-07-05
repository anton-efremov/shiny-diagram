/**
 * @fileoverview Spells the Shiny @spatial annotation line.
 */

import type { Point, Size, SpatialAttachment } from "../../../shared/geometry";
import type { ClassId } from "../../../shared/ids";

export function composeSpatialAnnotation(
  targetId: ClassId,
  spatial: SpatialAttachment | { readonly position: Point; readonly size: Size }
): string {
  const x = Math.round(spatial.position.x);
  const y = Math.round(spatial.position.y);
  return `%% @spatial:${targetId} x=${x} y=${y} w=${spatial.size.width} h=${spatial.size.height}`;
}
