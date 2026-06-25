/**
 * @fileoverview PlacementOverlay editor commands.
 * Extracted because PlacementOverlay is an exclusively owned child component of ReactFlowCanvasAdapter.
 */

import type { Rect } from "../../../../../../shared/geometry";

export type ClassAddCommand = {
  readonly type: "class.add";
  readonly rect: Rect;
};

// @job logic:command:derive
export function toClassAddCommand(rect: Rect): ClassAddCommand {
  return { type: "class.add", rect };
}
