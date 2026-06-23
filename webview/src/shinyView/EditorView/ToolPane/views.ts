/**
 * @fileoverview Render contract for the tool pane.
 */

import type { PlacementMode } from "../placementMode";

export type ToolPaneView = {
  readonly placementMode: PlacementMode | null;
};
