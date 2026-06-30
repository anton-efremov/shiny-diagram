/**
 * @behavior Draft rectangle state to render-ready placement overlay CSS positioning.
 */

import type { CSSProperties } from "react";
import type { Rect } from "../../../../../../shared/geometry";

// UI props derivation
export function toDraftStyle(draftRect: Rect | null): CSSProperties | undefined {
  return draftRect
    ? { left: draftRect.x, top: draftRect.y, width: draftRect.w, height: draftRect.h }
    : undefined;
}
