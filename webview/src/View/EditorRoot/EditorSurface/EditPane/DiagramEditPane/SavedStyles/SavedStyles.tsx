/**
 * @behavior Saved style selection state interpretation and chip activation routing.
 * @render Default style row, named style chips, and style creation action.
 */

import type { ReactElement } from "react";
import type { StyleDefId } from "../../../../../../shared/ids";
import type { SelectionState } from "../../../../../state/editorStates";
import type { DeclaredStyleView } from "../../../../../views/schema";
import Button from "../../../../../ui/primitives/Button/Button";
import StyledBoxSwatch from "../../../../../ui/primitives/StyledBoxSwatch/StyledBoxSwatch";
import ControlGroup from "../../../../../ui/templates/ControlGroup/ControlGroup";
import PaneSection from "../../../../../ui/templates/PaneSection/PaneSection";
import StyleChip from "./StyleChip/StyleChip";

type SavedStylesProps = {
  readonly view: readonly DeclaredStyleView[];
  readonly selectionState: SelectionState;
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
  readonly onCreate: () => void;
};

export default function SavedStyles({
  view,
  selectionState,
  onStyleSelect,
  onCreate,
}: SavedStylesProps): ReactElement {
  // View and State slice props derivation
  const defaultStyle = view.find((styleView) => styleView.name === "default");
  const namedStyles = view.filter((styleView) => styleView.name !== "default");

  // UI props derivation
  const selectedStyleId = selectionState.kind === "style" ? selectionState.styleDefId : undefined;

  return (
    <PaneSection label="Saved styles">
      <ControlGroup spacing="wide">
        {defaultStyle ? (
          <StyledBoxSwatch styleValues={defaultStyle.properties} label="Default" />
        ) : (
          <StyledBoxSwatch styleValues={{}} label="No default style" />
        )}
        <ControlGroup>
          {namedStyles.map((styleView) => (
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
