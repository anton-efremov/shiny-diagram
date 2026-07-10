/**
 * @behavior Style chip activation routing.
 * @render One saved-style swatch toggle.
 */

import type { ReactElement } from "react";
import type { StyleDefId } from "../../../../../../../shared/ids";
import type { StyleView } from "../../../../../../views/schema";
import SwatchToggle from "../../../../../../ui/composites/SwatchToggle/SwatchToggle";

type StyleChipProps = {
  readonly view: StyleView;
  readonly pressed: boolean;
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
};

export default function StyleChip({ view, pressed, onStyleSelect }: StyleChipProps): ReactElement {
  // Event handler props derivation
  const onClick = (): void => {
    onStyleSelect(view.styleId);
  };

  return (
    <SwatchToggle styleValues={view.style} label={view.name} pressed={pressed} onClick={onClick} />
  );
}
