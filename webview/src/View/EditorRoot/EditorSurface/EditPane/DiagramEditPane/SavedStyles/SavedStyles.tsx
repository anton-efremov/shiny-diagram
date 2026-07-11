/**
 * @behavior Saved style selection state interpretation and chip activation routing.
 * @render Base style and named-style chips plus style creation action.
 */

import type { ReactElement } from "react";
import { toStyleDefId, type StyleDefId } from "../../../../../../shared/ids";
import type { SelectionState } from "../../../../../state/editorStates";
import type { BaseStyleView, DeclaredStyleView } from "../../../../../views/schema";
import Button from "../../../../../ui/primitives/Button/Button";
import SwatchToggle from "../../../../../ui/composites/SwatchToggle/SwatchToggle";
import ControlGroup from "../../../../../ui/templates/ControlGroup/ControlGroup";
import PaneSection from "../../../../../ui/templates/PaneSection/PaneSection";
import StyleChip from "./StyleChip/StyleChip";
import { PURE_STYLE_DEFAULTS } from "../../../../../config/stylePresets";

type SavedStylesProps = {
  readonly view: readonly DeclaredStyleView[];
  readonly baseStyle: BaseStyleView;
  readonly selectionState: SelectionState;
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
  readonly onCreate: () => void;
};

export default function SavedStyles({
  view,
  baseStyle,
  selectionState,
  onStyleSelect,
  onCreate,
}: SavedStylesProps): ReactElement {
  // View and State slice props derivation
  // UI props derivation
  const selectedStyleId = selectionState.kind === "style" ? selectionState.styleDefId : undefined;
  const baseStyleId = toStyleDefId("default");
  const resolvedBaseStyle = { ...PURE_STYLE_DEFAULTS, ...baseStyle };

  return (
    <PaneSection label="Saved styles">
      <ControlGroup spacing="wide">
        <SwatchToggle
          styleValues={resolvedBaseStyle}
          label="Base style"
          pressed={selectedStyleId === baseStyleId}
          onClick={() => onStyleSelect(baseStyleId)}
        />
        <ControlGroup>
          {view.map((styleView) => (
            <StyleChip
              key={styleView.styleDefId}
              view={styleView}
              pressed={styleView.styleDefId === selectedStyleId}
              onStyleSelect={onStyleSelect}
            />
          ))}
        </ControlGroup>
      </ControlGroup>
      <Button label="+ New style" onClick={onCreate} />
    </PaneSection>
  );
}
