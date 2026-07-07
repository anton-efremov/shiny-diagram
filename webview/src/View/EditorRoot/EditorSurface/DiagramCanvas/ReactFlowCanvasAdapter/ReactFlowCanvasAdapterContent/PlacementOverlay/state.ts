/**
 * @behavior Initial draw origin and draft rectangle state for placement gestures.
 */

import type { Point, Rect } from "../../../../../../../shared/geometry";

export type DrawOrigin = {
  readonly pointerId: number;
  readonly client: Point;
  readonly diagram: Point;
};

// State initialization
export function toInitialOrigin(): DrawOrigin | null {
  return null;
}

export function toInitialDraftRect(): Rect | null {
  return null;
}
