/**
 * @logic ClassStylePane child UI prop derivation from selected class views.
 */

import type { ClassStyleProperties, ClassStyleProperty } from "../../../../../shared/style";
import type { ClassView } from "../../../../views/schema";

type ClassSelectionSummaryProps =
  | {
      readonly kind: "single";
      readonly label: string;
      readonly stereotype?: string;
    }
  | {
      readonly kind: "multi";
      readonly count: number;
    };

type ClassStylePreviewProps =
  | {
      readonly kind: "visible";
      readonly label: string;
      readonly style: ClassStyleProperties;
    }
  | {
      readonly kind: "hidden";
    };

type StyleColorControlProps = {
  readonly displayValue: string;
  readonly pickerValue: string;
  readonly swatchColor?: string;
  readonly mixed: boolean;
};

type ClassStyleControlsProps = {
  readonly fill: StyleColorControlProps;
  readonly border: StyleColorControlProps;
  readonly text: StyleColorControlProps;
};

type ClassStyleActionsProps = {
  readonly duplicateLabel: string;
  readonly deleteLabel: string;
};

type CommonStyleProperty =
  | {
      readonly kind: "common";
      readonly value: string | undefined;
      readonly pickerValue: string;
    }
  | {
      readonly kind: "multiple";
      readonly pickerValue: string;
    };

/** ── UI prop object area ──
 * Patterns: 4.5-4
 */
export function toClassSelectionSummaryProps(
  selectedClasses: readonly ClassView[]
): ClassSelectionSummaryProps {
  const selectedClass = selectedClasses.length === 1 ? selectedClasses[0] : undefined;
  if (selectedClass) {
    return {
      kind: "single",
      label: selectedClass.header.label,
      stereotype: selectedClass.header.stereotype,
    };
  }

  return {
    kind: "multi",
    count: selectedClasses.length,
  };
}

export function toClassStylePreviewProps(
  selectedClasses: readonly ClassView[]
): ClassStylePreviewProps {
  const selectedClass = selectedClasses.length === 1 ? selectedClasses[0] : undefined;
  if (!selectedClass) return { kind: "hidden" };

  return {
    kind: "visible",
    label: selectedClass.header.label,
    style: selectedClass.style ?? {},
  };
}

export function toClassStyleControlsProps(
  selectedClasses: readonly ClassView[]
): ClassStyleControlsProps {
  return {
    fill: toStyleColorControlProps(selectedClasses, "fill"),
    border: toStyleColorControlProps(selectedClasses, "stroke"),
    text: toStyleColorControlProps(selectedClasses, "color"),
  };
}

export function toClassStyleActionsProps(
  selectedClasses: readonly ClassView[]
): ClassStyleActionsProps {
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

/** ── private helper area ──
 * No annotation
 */
function toStyleColorControlProps(
  selectedClasses: readonly ClassView[],
  property: ClassStyleProperty
): StyleColorControlProps {
  const commonStyleProperty = toCommonStyleProperty(selectedClasses, property);
  if (commonStyleProperty.kind === "multiple") {
    return {
      displayValue: "Multiple",
      pickerValue: commonStyleProperty.pickerValue,
      mixed: true,
    };
  }

  return {
    displayValue: commonStyleProperty.value ?? "Default",
    pickerValue: commonStyleProperty.pickerValue,
    swatchColor: commonStyleProperty.value,
    mixed: false,
  };
}

function toCommonStyleProperty(
  selectedClasses: readonly ClassView[],
  property: ClassStyleProperty
): CommonStyleProperty {
  const values = selectedClasses.map((selectedClass) => selectedClass.style?.[property]);
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
