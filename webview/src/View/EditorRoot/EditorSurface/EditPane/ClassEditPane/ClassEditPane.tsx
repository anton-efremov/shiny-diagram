/**
 * @behavior Selected class style section routing.
 * @render Class style inspector sections.
 */

import type { ReactElement } from "react";
import type { StyleDefId } from "../../../../../shared/ids";
import type { SelectionState } from "../../../../state/editorStates";
import type { TransactionResult } from "../../../../commands/editorCommands";
import type { DiagramView } from "../../../../views/schema";
import ChangeStylePalette from "./ChangeStylePalette/ChangeStylePalette";
import ClassActions from "./ClassActions/ClassActions";
import HeaderTextControls from "./HeaderTextControls/HeaderTextControls";
import NamedStyleSelector from "./NamedStyleSelector/NamedStyleSelector";
import { useInteractions } from "./useInteractions";
import PaneSection from "../../../../ui/templates/PaneSection/PaneSection";
import Button from "../../../../ui/primitives/Button/Button";
import ControlGroup from "../../../../ui/templates/ControlGroup/ControlGroup";

type ClassEditPaneProps = {
  readonly view: Pick<DiagramView, "classes" | "styles">;
  readonly selectionState: Extract<SelectionState, { readonly kind: "classes" }>;
  readonly onStyleSelect: (
    styleDefId: StyleDefId,
    origin: Extract<SelectionState, { readonly kind: "classes" }>
  ) => void;
  readonly onStyleCreateCommitted: (
    result: TransactionResult,
    origin: Extract<SelectionState, { readonly kind: "classes" }>
  ) => void;
};

export default function ClassEditPane({
  view,
  selectionState,
  onStyleSelect,
  onStyleCreateCommitted,
}: ClassEditPaneProps): ReactElement {
  // View and State slice props derivation
  const selectedClassIds = new Set(selectionState.classIds);
  const selectedClasses = view.classes.filter((classView) =>
    selectedClassIds.has(classView.classId)
  );
  const selectedNamedStyleId =
    selectedClasses.length === 1 ? selectedClasses[0]?.appliedStyleId : undefined;
  const selectedNamedStyle = selectedNamedStyleId
    ? view.styles.find((styleView) => styleView.styleId === selectedNamedStyleId)
    : undefined;
  const selectedDirectStyle =
    selectedClasses.length === 1 && !selectedClasses[0]?.appliedStyleId && selectedClasses[0]?.style
      ? selectedClasses[0]
      : undefined;
  const origin = selectionState;

  // UI props derivation
  const styleActionLabel = selectedNamedStyle ? "Edit style" : "Save style";

  // Event handler props derivation
  const { onNameCommit, onAnnotationCommit, onLabelCommit, onStyleAction } = useInteractions({
    styles: view.styles,
    selectedNamedStyle,
    selectedDirectStyle,
    origin,
    onStyleSelect,
    onStyleCreateCommitted,
  });

  return (
    <>
      {selectedClasses.length === 1 ? (
        <PaneSection label="Class properties">
          <HeaderTextControls
            view={selectedClasses[0]}
            styleControl={
              <ControlGroup>
                <NamedStyleSelector view={selectedClasses} styles={view.styles} />
                <Button
                  label={styleActionLabel}
                  size="compact"
                  alignment="end"
                  disabled={!selectedNamedStyle && !selectedDirectStyle}
                  onClick={onStyleAction}
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
        <ChangeStylePalette view={selectedClasses} />
      </PaneSection>
      <PaneSection label="Actions">
        <ClassActions view={selectedClasses} />
      </PaneSection>
    </>
  );
}
