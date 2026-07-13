/**
 * @behavior Style property control routing.
 * @render Named style property controls.
 */

import type { ReactElement } from "react";
import { STYLE_PROPERTIES, type StylePropertyName } from "../../../../../../shared/style";
import type { BaseStyleView, DeclaredStyleView } from "../../../../../views/schema";
import { PURE_STYLE_DEFAULTS } from "../../../../../config/stylePresets";
import FieldGrid from "../../../../../../ui/chrome/templates/FieldGrid/FieldGrid";
import StylePropertyControl from "./StylePropertyControl/StylePropertyControl";
import type { ColorSelectPresetCatalog } from "../../../../../../ui/chrome/composites/ColorSelect/ColorSelect";

type ChangeStylePaletteProps = {
  readonly view: BaseStyleView | DeclaredStyleView["properties"];
  readonly presets: ColorSelectPresetCatalog;
  readonly documentColors: readonly string[];
  readonly widthSelectUIProps: StrokeSelectUIProps;
  readonly dashSelectUIProps: StrokeSelectUIProps;
  readonly baseStyle: BaseStyleView;
  readonly onPropertyChange: (property: StylePropertyName, value: string | null) => void;
};

type StrokeSelectUIProps = {
  readonly defaultValue: string;
  readonly documentValues: readonly string[];
};

export default function ChangeStylePalette({
  view,
  presets,
  documentColors,
  widthSelectUIProps,
  dashSelectUIProps,
  baseStyle,
  onPropertyChange,
}: ChangeStylePaletteProps): ReactElement {
  return (
    <FieldGrid
      variant="canvasStyle"
      rows={STYLE_PROPERTIES.map(({ name }) => ({
        label: toFieldLabel(name),
        control: (
          <StylePropertyControl
            property={name}
            value={view[name] ?? null}
            presets={presets}
            documentColors={documentColors}
            baseValue={baseStyle[name] ?? PURE_STYLE_DEFAULTS[name]}
            defaultValue={
              name === "strokeWidth"
                ? widthSelectUIProps.defaultValue
                : dashSelectUIProps.defaultValue
            }
            documentValues={
              name === "strokeWidth"
                ? widthSelectUIProps.documentValues
                : dashSelectUIProps.documentValues
            }
            onChange={(value) => onPropertyChange(name, value)}
          />
        ),
      }))}
    />
  );
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
