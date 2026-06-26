/**
 * @fileoverview PlacementOverlay editor command transactions.
 * Extracted because PlacementOverlay is an exclusively owned child component of ReactFlowCanvasAdapter.
 */

import type { Rect } from "../../../../../../shared/geometry";
import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";

// @job logic:command:derive
export function toClassCreateTransaction(rect: Rect): EditorCommandTransaction {
  return [
    {
      type: "class.create",
      position: { x: rect.x, y: rect.y },
      size: { width: rect.w, height: rect.h },
    },
  ];
}
