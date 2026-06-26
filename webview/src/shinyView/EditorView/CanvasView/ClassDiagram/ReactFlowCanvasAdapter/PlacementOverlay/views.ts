/**
 * @fileoverview PlacementOverlay render contract.
 * Extracted because PlacementOverlay is an exclusively owned child component of ReactFlowCanvasAdapter.
 */

import type { NodePlacementState } from "../../../../../state/editorStates";

export type PlacementOverlayView = {
  readonly nodePlacementState: NodePlacementState;
};
