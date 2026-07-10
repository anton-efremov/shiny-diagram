/**
 * @behavior Selected class style section routing.
 * @render Class style inspector sections.
 */

import type { ReactElement } from "react";
import type { StyleDefId } from "../../../../../shared/ids";
import type { ClassView, StyleView } from "../../../../views/schema";
import ChangeStylePalette from "./ChangeStylePalette/ChangeStylePalette";
import ClassActions from "./ClassActions/ClassActions";
import HeaderTextControls from "./HeaderTextControls/HeaderTextControls";
import NamedStyleSelector from "./NamedStyleSelector/NamedStyleSelector";
import { useInteractions } from "./useInteractions";
import PaneSection from "../../../../ui/templates/PaneSection/PaneSection";
import Button from "../../../../ui/primitives/Button/Button";
import ControlGroup from "../../../../ui/templates/ControlGroup/ControlGroup";

type ClassEditPaneProps = {
  readonly view: readonly ClassView[];
  readonly styles: readonly StyleView[];
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
};

export default function ClassEditPane({
  view,
  styles: styleViews,
  onStyleSelect,
}: ClassEditPaneProps): ReactElement {
  // Event handler props derivation
  const { onNameCommit, onAnnotationCommit, onLabelCommit } = useInteractions();
  const selectedNamedStyle = toSelectedNamedStyle(view, styleViews);

  return (
    <>
      {view.length === 1 ? (
        <PaneSection label="Class properties">
          <HeaderTextControls
            view={view[0]}
            styleControl={
              <ControlGroup>
                <NamedStyleSelector view={view} styles={styleViews} />
                <Button
                  label="Edit style"
                  disabled={selectedNamedStyle === null}
                  onClick={() => {
                    if (selectedNamedStyle) onStyleSelect(selectedNamedStyle.styleId);
                  }}
                />
              </ControlGroup>
            }
            onNameCommit={onNameCommit}
            onAnnotationCommit={onAnnotationCommit}
            onLabelCommit={onLabelCommit}
          />
        </PaneSection>
      ) : null}
      <PaneSection label="Configure style">
        <ChangeStylePalette view={view} />
      </PaneSection>
      <PaneSection label="Actions">
        <ClassActions view={view} />
      </PaneSection>
    </>
  );
}

function toSelectedNamedStyle(
  classes: readonly ClassView[],
  styles: readonly StyleView[]
): StyleView | null {
  const appliedStyleId = classes.length === 1 ? classes[0]?.appliedStyleId : null;
  if (!appliedStyleId) return null;
  return styles.find((styleView) => styleView.styleId === appliedStyleId) ?? null;
}
