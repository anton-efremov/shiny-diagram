/**
 * @behavior Named style property edit routing.
 * @render Named style property controls.
 */

import type { ReactElement } from "react";
import { STYLE_PROPERTIES, type StylePropertyName } from "../../../../../../shared/style";
import type { StyleView } from "../../../../../views/schema";
import {
  STYLE_COLOR_PRESETS,
  STYLE_STROKE_DASHARRAY_PRESETS,
  STYLE_STROKE_WIDTH_PRESETS,
} from "../../../../../config/editorUiConfig";
import Dropdown from "../../../../../ui/composites/Dropdown/Dropdown";
import type { DropdownOption } from "../../../../../ui/composites/Dropdown/Dropdown";
import FieldGrid from "../../../../../ui/templates/FieldGrid/FieldGrid";
import { useInteractions } from "./useInteractions";

type ChangeStylePaletteProps = {
  readonly view: StyleView;
};

export default function ChangeStylePalette({ view }: ChangeStylePaletteProps): ReactElement {
  // Event handler props derivation
  const { onPropertyChange } = useInteractions(view);

  return (
    <FieldGrid
      rows={STYLE_PROPERTIES.map(({ name }) => ({
        label: toFieldLabel(name),
        control: (
          <StylePropertyControl
            property={name}
            value={view.style[name]}
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
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
}): ReactElement {
  const selectedValue = value ?? "";

  return (
    <Dropdown
      options={toStylePresetOptions(property)}
      value={selectedValue}
      onChange={(nextValue) => onChange(toNullableValue(nextValue))}
    />
  );
}

function toStylePresetOptions(property: StylePropertyName): readonly DropdownOption[] {
  if (property === "strokeWidth" || property === "strokeDasharray") {
    return toStrokePresetOptions(property);
  }

  return STYLE_COLOR_PRESETS.map((preset) => {
    return {
      value: preset.value,
      label: preset.label,
      swatchKind: toSwatchKind(property),
      swatchStyle: {
        fill: property === "fill" ? toSwatchColor(preset.value) : null,
        stroke: property === "stroke" ? toSwatchColor(preset.value) : null,
        color: property === "color" ? toSwatchColor(preset.value) : null,
      },
    };
  });
}

function toStrokePresetOptions(property: StylePropertyName): readonly DropdownOption[] {
  const presets =
    property === "strokeWidth" ? STYLE_STROKE_WIDTH_PRESETS : STYLE_STROKE_DASHARRAY_PRESETS;

  return presets.map((preset) => ({
    value: preset.value,
    label: preset.label,
    swatchKind: toSwatchKind(property),
    swatchStyle: {
      strokeWidth: property === "strokeWidth" ? preset.value || null : null,
      strokeDasharray: property === "strokeDasharray" ? preset.value || null : null,
    },
  }));
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
      return "Text";
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
