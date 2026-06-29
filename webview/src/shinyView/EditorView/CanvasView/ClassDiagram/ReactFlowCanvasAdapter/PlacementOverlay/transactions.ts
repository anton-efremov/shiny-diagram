/**
 * @logic PlacementOverlay command transaction derivation.
 */

import type { Rect } from "../../../../../../shared/geometry";
import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";

/** ── transaction builder area ──
 * Patterns: 4.9-1
 */
export function toClassCreateTransaction(rect: Rect): EditorCommandTransaction {
  return [
    {
      type: "class.create",
      position: { x: rect.x, y: rect.y },
      size: { width: rect.w, height: rect.h },
    },
  ];
}
