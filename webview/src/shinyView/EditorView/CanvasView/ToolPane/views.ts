/**
 * @fileoverview Render contract for the tool pane.
 */

import type { NodePlacementState } from "../../../state/editorStates";

export type ToolPaneView = {
  readonly nodePlacementState: NodePlacementState;
};
