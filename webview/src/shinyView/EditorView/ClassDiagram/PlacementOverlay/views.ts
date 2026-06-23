/**
 * @fileoverview Render contract for the placement overlay.
 */

import type { PlacementMode } from "../../placementMode";

export type PlacementOverlayView = {
  readonly placementMode: PlacementMode | null;
};
