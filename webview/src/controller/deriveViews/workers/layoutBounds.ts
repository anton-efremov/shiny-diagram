/**
 * @fileoverview Geometry helpers for deriveViews layout projections.
 */

import type { Rect } from "../../../shared/geometry";

/**
 * Computes the padded bounds containing all supplied rectangles.
 */
export function unionRects(rects: readonly Rect[]): Rect {
  const padding = 12;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const r of rects) {
    if (r.x < minX) minX = r.x;
    if (r.y < minY) minY = r.y;
    if (r.x + r.w > maxX) maxX = r.x + r.w;
    if (r.y + r.h > maxY) maxY = r.y + r.h;
  }

  return {
    x: minX - padding,
    y: minY - padding,
    w: maxX - minX + padding * 2,
    h: maxY - minY + padding * 2,
  };
}
