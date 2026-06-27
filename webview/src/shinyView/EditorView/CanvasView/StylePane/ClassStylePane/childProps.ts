/**
 * @fileoverview Child prop derivation for pure UI children.
 *
 * Standard pattern:
 * - File name: `childProps.ts`.
 * - Exports `toXProps(...)` pure helpers for child render components.
 * - Input: canonical view slices from the parent product component.
 * - Output: display props for pure UI children.
 * - Imports child prop types from direct child components.
 * - May omit intent-handler props when handlers are wired in the parent component.
 * - No React imports, no context access, no command dispatch, no state ownership.
 */

import type { ClassStyleProperty } from "../../../../../shared/style";
import type { ClassView } from "../../../../views/schema";
import type { ClassSelectionSummaryProps } from "./ClassSelectionSummary/ClassSelectionSummary";
import type { ClassStyleActionsProps } from "./ClassStyleActions/ClassStyleActions";
import type {
  ClassStyleControlsProps,
  StyleColorControlProps,
} from "./ClassStyleControls/ClassStyleControls";
import type { ClassStylePreviewProps } from "./ClassStylePreview/ClassStylePreview";

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
): Omit<
  ClassStyleControlsProps,
  "onFillColorChange" | "onBorderColorChange" | "onTextColorChange"
> {
  return {
    fill: toStyleColorControlProps(selectedClasses, "fill"),
    border: toStyleColorControlProps(selectedClasses, "stroke"),
    text: toStyleColorControlProps(selectedClasses, "color"),
  };
}

export function toClassStyleActionsProps(
  selectedClasses: readonly ClassView[]
): Omit<ClassStyleActionsProps, "onDuplicate" | "onDeleteClick"> {
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
