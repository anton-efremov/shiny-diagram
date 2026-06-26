/**
 * @fileoverview Multi-class style pane scenario render contract.
 */

import type { ClassBoxView } from "../../ClassDiagram/views";
import type { AggregatedClassStyles } from "../styleAggregation";

export type MultiClassStylePaneView = {
  readonly classViews: readonly ClassBoxView[];
  readonly aggregatedStyles: AggregatedClassStyles;
};
