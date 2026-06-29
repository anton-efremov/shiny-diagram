/**
 * @logic PlacementOverlay child UI prop derivation from draft rectangle state.
 */

import type { CSSProperties } from "react";
import type { Rect } from "../../../../../../shared/geometry";

/** ── single UI prop area ──
 * Patterns: 4.5-3
 */
export function toDraftStyle(draftRect: Rect | null): CSSProperties | undefined {
  return draftRect
    ? { left: draftRect.x, top: draftRect.y, width: draftRect.w, height: draftRect.h }
    : undefined;
}
