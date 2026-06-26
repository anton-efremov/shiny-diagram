/**
 * @fileoverview Single-class style pane scenario render contract.
 */

import type { ClassBoxView } from "../../ClassDiagram/views";
import type { AggregatedClassStyles } from "../styleAggregation";

export type SingleClassStylePaneView = {
  readonly classView: ClassBoxView;
  readonly aggregatedStyles: AggregatedClassStyles;
};
