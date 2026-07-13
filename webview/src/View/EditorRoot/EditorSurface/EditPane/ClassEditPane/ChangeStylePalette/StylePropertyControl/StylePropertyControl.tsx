/**
 * @behavior Class style color and stroke preset normalization.
 * @render One class style property selector.
 */

import type { ReactElement } from "react";
import type { StylePropertyName } from "../../../../../../../shared/style";
import { DASH_PRESETS, WIDTH_PRESETS } from "../../../../../../config/stylePresets";
import { CHROME_SELECTOR_POPUP_ABOVE_CONTROL_Z_INDEX } from "../../../../../../config/editorUiConfig";
import ColorSelect from "../../../../../../../ui/chrome/composites/ColorSelect/ColorSelect";
import type { ColorSelectPresetCatalog } from "../../../../../../../ui/chrome/composites/ColorSelect/ColorSelect";
import StrokeSelect from "../../../../../../../ui/chrome/composites/StrokeSelect/StrokeSelect";

type StylePropertyControlProps = {
  readonly property: StylePropertyName;
  readonly value: string | null | "multiple";
  readonly presets: ColorSelectPresetCatalog;
  readonly documentColors: readonly string[];
  readonly baseValue?: string;
  readonly defaultValue: string;
  readonly documentValues: readonly string[];
  readonly onChange: (value: string | null) => void;
};

export default function StylePropertyControl({
  property,
  value,
  presets,
  documentColors,
  baseValue,
  defaultValue,
  documentValues,
  onChange,
}: StylePropertyControlProps): ReactElement {
  // UI props derivation
  if (isColorProperty(property)) {
    return (
      <ColorSelect
        preview={property === "color" ? "text" : property}
        value={value}
        presets={presets}
        documentColors={documentColors}
        baseValue={baseValue}
        stacking={CHROME_SELECTOR_POPUP_ABOVE_CONTROL_Z_INDEX}
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
      stacking={CHROME_SELECTOR_POPUP_ABOVE_CONTROL_Z_INDEX}
      onChange={onChange}
    />
  );
}

// Private helpers
function isColorProperty(property: StylePropertyName): property is "fill" | "stroke" | "color" {
  return property === "fill" || property === "stroke" || property === "color";
}
