/**
 * @behavior Named style property edit routing.
 * @render Named style property controls.
 */

import type { ReactElement } from "react";
import { STYLE_PROPERTIES, type StylePropertyName } from "../../../../../../shared/style";
import type { DeclaredStyleView } from "../../../../../views/schema";
import FieldGrid from "../../../../../ui/templates/FieldGrid/FieldGrid";
import StylePropertyControl from "./StylePropertyControl/StylePropertyControl";
import { useInteractions } from "./useInteractions";
import type { ColorSelectPresetCatalog } from "../../../../../ui/composites/ColorSelect/ColorSelect";

type ChangeStylePaletteProps = {
  readonly view: DeclaredStyleView;
  readonly presets: ColorSelectPresetCatalog;
  readonly documentColors: readonly string[];
  readonly widthSelectUIProps: StrokeSelectUIProps;
  readonly dashSelectUIProps: StrokeSelectUIProps;
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
}: ChangeStylePaletteProps): ReactElement {
  // Event handler props derivation
  const { onPropertyChange } = useInteractions(view);

  return (
    <FieldGrid
      controlWidth="half"
      labelWidth="standard"
      rows={STYLE_PROPERTIES.map(({ name }) => ({
        label: toFieldLabel(name),
        control: (
          <StylePropertyControl
            property={name}
            value={view.properties[name]}
            presets={presets}
            documentColors={documentColors}
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
