/**
 * @fileoverview Class style pane child-view derivation.
 */

import type { ClassStyleProperties } from "../../../../../shared/diagramVocabulary";
import type { ClassStyleTargetView } from "./views";

type StyleProperty = "fill" | "stroke" | "color";

type CommonStylePropertyView =
  | {
      readonly kind: "common";
      readonly value: string | undefined;
      readonly pickerValue: string;
    }
  | {
      readonly kind: "multiple";
      readonly pickerValue: string;
    };

export type ClassSelectionSummaryView =
  | {
      readonly kind: "single";
      readonly label: string;
      readonly stereotype?: string;
    }
  | {
      readonly kind: "multi";
      readonly count: number;
    };

export type ClassPreviewView =
  | {
      readonly kind: "visible";
      readonly label: string;
      readonly styleName?: string;
      readonly style: ClassStyleProperties;
    }
  | {
      readonly kind: "hidden";
    };

export type StyleColorControlView = {
  readonly displayValue: string;
  readonly pickerValue: string;
  readonly swatchColor?: string;
  readonly mixed: boolean;
};

export type ClassStyleControlsView = {
  readonly fill: StyleColorControlView;
  readonly border: StyleColorControlView;
  readonly text: StyleColorControlView;
};

export type ClassStyleActionsView = {
  readonly duplicateLabel: string;
  readonly deleteLabel: string;
};

// @job logic:child:view
export function toClassSelectionSummaryView(
  selectedClasses: readonly ClassStyleTargetView[]
): ClassSelectionSummaryView {
  const selectedClass = selectedClasses.length === 1 ? selectedClasses[0] : undefined;
  if (selectedClass) {
    return {
      kind: "single",
      label: selectedClass.label,
      stereotype: selectedClass.stereotype,
    };
  }

  return {
    kind: "multi",
    count: selectedClasses.length,
  };
}

// @job logic:child:view
export function toClassPreviewView(
  selectedClasses: readonly ClassStyleTargetView[]
): ClassPreviewView {
  const selectedClass = selectedClasses.length === 1 ? selectedClasses[0] : undefined;
  if (!selectedClass) return { kind: "hidden" };

  return {
    kind: "visible",
    label: selectedClass.label,
    styleName: selectedClass.styleName,
    style: selectedClass.style,
  };
}

// @job logic:child:view
export function toClassStyleControlsView(
  selectedClasses: readonly ClassStyleTargetView[]
): ClassStyleControlsView {
  return {
    fill: toStyleColorControlView(selectedClasses, "fill"),
    border: toStyleColorControlView(selectedClasses, "stroke"),
    text: toStyleColorControlView(selectedClasses, "color"),
  };
}

// @job logic:child:view
export function toClassStyleActionsView(
  selectedClasses: readonly ClassStyleTargetView[]
): ClassStyleActionsView {
  return selectedClasses.length === 1
    ? {
        duplicateLabel: "Duplicate",
        deleteLabel: "Delete class",
      }
    : {
        duplicateLabel: "Duplicate selected",
        deleteLabel: "Delete selected",
      };
}

function toStyleColorControlView(
  selectedClasses: readonly ClassStyleTargetView[],
  property: StyleProperty
): StyleColorControlView {
  const commonProperty = toCommonStylePropertyView(selectedClasses, property);
  if (commonProperty.kind === "multiple") {
    return {
      displayValue: "Multiple",
      pickerValue: commonProperty.pickerValue,
      mixed: true,
    };
  }

  return {
    displayValue: commonProperty.value ?? "Default",
    pickerValue: commonProperty.pickerValue,
    swatchColor: commonProperty.value,
    mixed: false,
  };
}

function toCommonStylePropertyView(
  selectedClasses: readonly ClassStyleTargetView[],
  property: StyleProperty
): CommonStylePropertyView {
  const values = selectedClasses.map((selectedClass) => selectedClass.style[property]);
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
