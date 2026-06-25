/**
 * @fileoverview Render contract for the style pane.
 */

import type { ClassBoxView } from "../ClassDiagram/views";

export type StylePaneView = {
  readonly selectedClassViews: readonly ClassBoxView[];
};
