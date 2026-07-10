/**
 * @behavior Style property preset selection normalization.
 * @render One named-style property dropdown.
 */

import type { ReactElement } from "react";
import type { StylePropertyName } from "../../../../../../../shared/style";
import {
  STYLE_COLOR_PRESETS,
  STYLE_STROKE_DASHARRAY_PRESETS,
  STYLE_STROKE_WIDTH_PRESETS,
} from "../../../../../../config/editorUiConfig";
import Dropdown from "../../../../../../ui/composites/Dropdown/Dropdown";
import type { DropdownOption } from "../../../../../../ui/composites/Dropdown/Dropdown";

type StylePropertyControlProps = {
  readonly property: StylePropertyName;
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
};

export default function StylePropertyControl({
  property,
  value,
  onChange,
}: StylePropertyControlProps): ReactElement {
  // UI props derivation
  const options = toStylePresetOptions(property);
  const selectedValue = value ?? "";

  // Event handler props derivation
  const onValueChange = (nextValue: string): void => {
    onChange(nextValue === "" ? null : nextValue);
  };

  return <Dropdown options={options} value={selectedValue} onChange={onValueChange} />;
}

// Private helpers
function toStylePresetOptions(property: StylePropertyName): readonly DropdownOption[] {
  if (property === "strokeWidth" || property === "strokeDasharray") {
    return toStrokePresetOptions(property);
  }

  return STYLE_COLOR_PRESETS.map((preset) => ({
    value: preset.value,
    label: preset.label,
    isLabelVisible: false,
    swatchKind: toSwatchKind(property),
    swatchStyle: {
      fill: property === "fill" ? toSwatchColor(preset.value) : null,
      stroke: property === "stroke" ? toSwatchColor(preset.value) : null,
      color: property === "color" ? toSwatchColor(preset.value) : null,
    },
  }));
}

function toStrokePresetOptions(property: StylePropertyName): readonly DropdownOption[] {
  const presets =
    property === "strokeWidth" ? STYLE_STROKE_WIDTH_PRESETS : STYLE_STROKE_DASHARRAY_PRESETS;

  return presets.map((preset) => ({
    value: preset.value,
    label: preset.label,
    isLabelVisible: false,
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
