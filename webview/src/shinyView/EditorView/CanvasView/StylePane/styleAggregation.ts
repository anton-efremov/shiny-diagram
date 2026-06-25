/**
 * @fileoverview View-side style aggregation for selected class boxes.
 */

import type { ClassBoxView } from "../ClassDiagram/views";

type StyleProperty = "fill" | "stroke" | "color";

export type AggregatedStyleProperty =
  | {
      readonly kind: "common";
      readonly value: string | undefined;
      readonly pickerValue: string;
    }
  | {
      readonly kind: "multiple";
      readonly pickerValue: string;
    };

export type AggregatedClassStyles = {
  readonly fill: AggregatedStyleProperty;
  readonly stroke: AggregatedStyleProperty;
  readonly color: AggregatedStyleProperty;
};

export function aggregateClassStyles(
  selectedClassViews: readonly ClassBoxView[]
): AggregatedClassStyles {
  return {
    fill: aggregateProperty(selectedClassViews, "fill"),
    stroke: aggregateProperty(selectedClassViews, "stroke"),
    color: aggregateProperty(selectedClassViews, "color"),
  };
}

function aggregateProperty(
  selectedClassViews: readonly ClassBoxView[],
  property: StyleProperty
): AggregatedStyleProperty {
  const values = selectedClassViews.map((view) => view.style?.[property]);
  const first = values[0];
  const firstNormalized = normalizeColor(first);
  const isCommon = values.every((value) => {
    if (first === undefined || value === undefined) return first === value;
    return normalizeColor(value) === firstNormalized;
  });
  const pickerValue = findPickerValue(values);

  if (isCommon) {
    return { kind: "common", value: first, pickerValue };
  }

  return { kind: "multiple", pickerValue };
}

function findPickerValue(values: readonly (string | undefined)[]): string {
  const common = values[0];
  if (isSixDigitHex(common)) return toSixDigitHex(common);

  for (const value of values) {
    if (isSixDigitHex(value)) return toSixDigitHex(value);
  }

  return "#ffffff";
}

function normalizeColor(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase();
}

function isSixDigitHex(value: string | undefined): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value?.trim() ?? "");
}

function toSixDigitHex(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "#ffffff";
}
