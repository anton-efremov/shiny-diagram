/**
 * @fileoverview Ready editor-state interface render contract.
 */

import type { ClassDiagramView } from "./ClassDiagram/views";
import type { StylePaneView } from "./StylePane/views";
import type { ToolPaneView } from "./ToolPane/views";

export type CanvasViewModel = {
  readonly toolPaneView: ToolPaneView;
  readonly classDiagramView: ClassDiagramView;
  readonly stylePaneView: StylePaneView;
};
