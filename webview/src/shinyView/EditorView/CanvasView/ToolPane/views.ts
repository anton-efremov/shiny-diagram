/**
 * @fileoverview Render contract for the tool pane.
 */

import type { PlacementMode } from "../state";

export type ToolPaneView = {
  readonly placementMode: PlacementMode | null;
};
