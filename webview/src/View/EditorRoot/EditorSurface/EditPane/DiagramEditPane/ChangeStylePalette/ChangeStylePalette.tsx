/**
 * @behavior Named style property edit routing.
 * @render Named style property controls.
 */

import type { ReactElement } from "react";
import { STYLE_PROPERTIES, type StylePropertyName } from "../../../../../../shared/style";
import type { StyleView } from "../../../../../views/schema";
import FieldGrid from "../../../../../ui/templates/FieldGrid/FieldGrid";
import StylePropertyControl from "./StylePropertyControl/StylePropertyControl";
import { useInteractions } from "./useInteractions";

type ChangeStylePaletteProps = {
  readonly view: StyleView;
};

export default function ChangeStylePalette({ view }: ChangeStylePaletteProps): ReactElement {
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
            value={view.style[name]}
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
