/**
 * @behavior Selected class style property common-value derivation.
 * @render Class style property controls.
 */

import type { ReactElement } from "react";
import {
  STYLE_PROPERTIES,
  type StyleProperties,
  type StylePropertyName,
} from "../../../../../../shared/style";
import type { ClassView } from "../../../../../views/schema";
import {
  STYLE_COLOR_PRESETS,
  STYLE_STROKE_DASHARRAY_PRESETS,
  STYLE_STROKE_WIDTH_PRESETS,
} from "../../../../../config/editorUiConfig";
import Dropdown from "../../../../../ui/composites/Dropdown/Dropdown";
import type { DropdownOption } from "../../../../../ui/composites/Dropdown/Dropdown";
import FieldGrid from "../../../../../ui/templates/FieldGrid/FieldGrid";
import { useInteractions } from "./useInteractions";

const EMPTY_STYLE_PROPERTIES: StyleProperties = {
  fill: null,
  stroke: null,
  strokeWidth: null,
  strokeDasharray: null,
  color: null,
};

type ChangeStylePaletteProps = {
  readonly view: readonly ClassView[];
};

export default function ChangeStylePalette({ view }: ChangeStylePaletteProps): ReactElement {
  // Event handler props derivation
  const { onPropertyChange } = useInteractions(view);

  return (
    <FieldGrid
      inset
      controlWidth="half"
      rows={STYLE_PROPERTIES.map(({ name }) => ({
        label: toFieldLabel(name),
        control: (
          <StylePropertyControl
            property={name}
            value={toCommonPropertyValue(view, name)}
            onChange={(value) => onPropertyChange(name, value)}
          />
        ),
      }))}
    />
  );
}

function StylePropertyControl({
  property,
  value,
  onChange,
}: {
  readonly property: StylePropertyName;
  readonly value: string | null | "multiple";
  readonly onChange: (value: string | null) => void;
}): ReactElement {
  const selectedValue = value ?? "";
  return (
    <Dropdown
      options={toStylePresetOptions(property, value)}
      value={selectedValue}
      onChange={(nextValue) => nextValue !== "multiple" && onChange(toNullableValue(nextValue))}
    />
  );
}

// Private helpers
function toCommonPropertyValue(
  classes: readonly ClassView[],
  property: StylePropertyName
): string | null | "multiple" {
  const first = (classes[0]?.style ?? EMPTY_STYLE_PROPERTIES)[property];
  return classes.every(
    (classView) => (classView.style ?? EMPTY_STYLE_PROPERTIES)[property] === first
  )
    ? first
    : "multiple";
}

function toStylePresetOptions(
  property: StylePropertyName,
  value: string | null | "multiple"
): readonly DropdownOption[] {
  if (property === "strokeWidth" || property === "strokeDasharray") {
    return toStrokePresetOptions(property, value);
  }

  return [
    ...(value === "multiple" ? [toMultipleOption(property)] : []),
    ...STYLE_COLOR_PRESETS.map((preset) => {
      return {
        value: preset.value,
        label: preset.label,
        isLabelVisible: false,
        swatchKind: toSwatchKind(property),
        swatchStyle: {
          fill: property === "fill" ? toSwatchColor(preset.value) : null,
          stroke: property === "stroke" ? toSwatchColor(preset.value) : null,
          color: property === "color" ? toSwatchColor(preset.value) : null,
        },
      };
    }),
  ];
}

function toStrokePresetOptions(
  property: StylePropertyName,
  value: string | null | "multiple"
): readonly DropdownOption[] {
  const presets =
    property === "strokeWidth" ? STYLE_STROKE_WIDTH_PRESETS : STYLE_STROKE_DASHARRAY_PRESETS;

  return [
    ...(value === "multiple" ? [toMultipleOption(property)] : []),
    ...presets.map((preset) => ({
      value: preset.value,
      label: preset.label,
      isLabelVisible: false,
      swatchKind: toSwatchKind(property),
      swatchStyle: {
        strokeWidth: property === "strokeWidth" ? preset.value || null : null,
        strokeDasharray: property === "strokeDasharray" ? preset.value || null : null,
      },
    })),
  ];
}

function toSwatchColor(value: string): string | null {
  return value === "" ? null : value;
}

function toNullableValue(value: string): string | null {
  return value === "" ? null : value;
}

function toFieldLabel(property: StylePropertyName): string {
  switch (property) {
    case "fill":
      return "Fill";
    case "stroke":
      return "Stroke";
    case "strokeWidth":
      return "Width";
    case "strokeDasharray":
      return "Dash";
    case "color":
      return "Text color";
  }
}

function toSwatchKind(property: StylePropertyName): DropdownOption["swatchKind"] {
  switch (property) {
    case "fill":
      return "box";
    case "stroke":
    case "strokeWidth":
      return "line";
    case "strokeDasharray":
      return "dash";
    case "color":
      return "text";
  }
}

function toMultipleOption(property: StylePropertyName): DropdownOption {
  return {
    value: "multiple",
    label: "multiple",
    isLabelVisible: false,
    swatchKind: toSwatchKind(property),
    swatchStyle: {},
  };
}
