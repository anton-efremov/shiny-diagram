/**
 * @state origin and draftRect initial values for placement gestures.
 */

import type { Point, Rect } from "../../../../../../shared/geometry";

export type DrawOrigin = {
  readonly pointerId: number;
  readonly client: Point;
  readonly flow: Point;
};

/** Initial state: draw gesture anchor */
export function toInitialOrigin(): DrawOrigin | null {
  return null;
}

/** Initial state: current placement outline */
export function toInitialDraftRect(): Rect | null {
  return null;
}
