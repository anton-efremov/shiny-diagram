/**
 * @fileoverview Render contract for the placement overlay.
 */

import type { PlacementMode } from "../../state";

export type PlacementOverlayView = {
  readonly placementMode: PlacementMode | null;
};
