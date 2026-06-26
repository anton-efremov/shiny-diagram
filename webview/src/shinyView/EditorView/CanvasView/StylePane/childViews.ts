/**
 * @fileoverview StylePane scenario and control child-view derivation.
 */

import { aggregateClassStyles } from "./styleAggregation";
import type { AggregatedStyleProperty } from "./styleAggregation";
import type { StylePaneScenarioView, StylePaneView } from "./views";

// @job logic:child:view
export function toStylePaneScenarioView(view: StylePaneView): StylePaneScenarioView {
  const { selectedClassViews } = view;
  if (selectedClassViews.length === 0) return { kind: "empty", view: {} };

  const aggregatedStyles = aggregateClassStyles(selectedClassViews);
  if (selectedClassViews.length === 1) {
    const classView = selectedClassViews[0];

    return {
      kind: "singleClass",
      view: {
        classView,
        aggregatedStyles,
      },
    };
  }

  return {
    kind: "multiClass",
    view: {
      classViews: selectedClassViews,
      aggregatedStyles,
    },
  };
}

// @job logic:child:view
export function toColorSelectorProps(property: AggregatedStyleProperty): {
  readonly displayValue: string;
  readonly pickerValue: string;
  readonly swatchColor?: string;
  readonly mixed: boolean;
} {
  if (property.kind === "multiple") {
    return {
      displayValue: "Multiple",
      pickerValue: property.pickerValue,
      mixed: true,
    };
  }

  return {
    displayValue: property.value ?? "Default",
    pickerValue: property.pickerValue,
    swatchColor: property.value,
    mixed: false,
  };
}
