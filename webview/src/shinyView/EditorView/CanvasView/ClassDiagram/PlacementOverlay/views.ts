/**
 * @fileoverview Render contract for the placement overlay.
 */

import type { PlacementMode } from "../../editorState";

export type PlacementOverlayView = {
  readonly placementMode: PlacementMode | null;
};
