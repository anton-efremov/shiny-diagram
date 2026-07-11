/**
 * @behavior Namespace style color and line preset normalization.
 * @render One namespace style property selector.
 */

import type { ReactElement } from "react";
import type { StylePropertyName } from "../../../../../../shared/style";
import {
  DASH_PRESETS,
  PURE_STYLE_DEFAULTS,
  WIDTH_PRESETS,
} from "../../../../../config/stylePresets";
import ColorSelect from "../../../../../ui/composites/ColorSelect/ColorSelect";
import type { ColorSelectPresetCatalog } from "../../../../../ui/composites/ColorSelect/ColorSelect";
import StrokeSelect from "../../../../../ui/composites/StrokeSelect/StrokeSelect";

type StylePropertyControlProps = {
  readonly property: StylePropertyName;
  readonly value: string | null;
  readonly presets: ColorSelectPresetCatalog;
  readonly documentColors: readonly string[];
  readonly defaultValue: string;
  readonly documentValues: readonly string[];
  readonly onChange: (value: string | null) => void;
};

export default function StylePropertyControl({
  property,
  value,
  presets,
  documentColors,
  defaultValue,
  documentValues,
  onChange,
}: StylePropertyControlProps): ReactElement {
  // UI props derivation
  if (isColorProperty(property)) {
    return (
      <ColorSelect
        glyph={property === "color" ? "text" : property}
        presets={presets}
        documentColors={documentColors}
        baseValue={PURE_STYLE_DEFAULTS[property]}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <StrokeSelect
      kind={property === "strokeWidth" ? "width" : "dash"}
      value={value}
      defaultValue={defaultValue}
      presets={property === "strokeWidth" ? WIDTH_PRESETS : DASH_PRESETS}
      documentValues={documentValues}
      onChange={onChange}
    />
  );
}

// Private helpers
function isColorProperty(property: StylePropertyName): property is "fill" | "stroke" | "color" {
  return property === "fill" || property === "stroke" || property === "color";
}
