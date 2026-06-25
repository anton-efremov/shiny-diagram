/**
 * @fileoverview PlacementOverlay render contract.
 * Extracted because PlacementOverlay is an exclusively owned child component of ReactFlowCanvasAdapter.
 */

import type { PlacementMode } from "../../../state";

export type PlacementOverlayView = {
  readonly placementMode: PlacementMode | null;
};
