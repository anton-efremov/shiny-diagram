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
import ColorSelect from "../../../../../ui/composites/ColorSelect/ColorSelect";
import Dropdown from "../../../../../ui/composites/Dropdown/Dropdown";
import type { DropdownOption } from "../../../../../ui/composites/Dropdown/Dropdown";
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
    <>
      {STYLE_PROPERTIES.map(({ name }) => (
        <StylePropertyControl
          key={name}
          property={name}
          value={toCommonPropertyValue(view, name)}
          onChange={(value) => onPropertyChange(name, value)}
        />
      ))}
    </>
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
  return isColorProperty(property) ? (
    <ColorSelect
      presets={toColorPresetOptions(property, value)}
      value={selectedValue}
      onChange={(nextValue) => nextValue !== "multiple" && onChange(toNullableValue(nextValue))}
    />
  ) : (
    <Dropdown
      options={toStrokePresetOptions(property, value)}
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

function isColorProperty(property: StylePropertyName): boolean {
  return property === "fill" || property === "stroke" || property === "color";
}

function toColorPresetOptions(
  property: StylePropertyName,
  value: string | null | "multiple"
): readonly DropdownOption[] {
  return [
    ...(value === "multiple"
      ? [{ value: "multiple", label: `${toLabel(property)}: multiple` }]
      : []),
    ...STYLE_COLOR_PRESETS.map((preset) => {
      const label = `${toLabel(property)}: ${preset.label}`;
      return {
        value: preset.value,
        label,
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
    ...(value === "multiple"
      ? [{ value: "multiple", label: `${toLabel(property)}: multiple` }]
      : []),
    ...presets.map((preset) => ({
      value: preset.value,
      label: `${toLabel(property)}: ${preset.label}`,
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

function toLabel(property: StylePropertyName): string {
  switch (property) {
    case "fill":
      return "Fill";
    case "stroke":
      return "Stroke";
    case "strokeWidth":
      return "Stroke width";
    case "strokeDasharray":
      return "Stroke dasharray";
    case "color":
      return "Text";
  }
}
