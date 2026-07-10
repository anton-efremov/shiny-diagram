/**
 * @behavior Diagram style management and selected-style section routing.
 * @render Saved styles and named style inspector sections.
 */

import type { ReactElement } from "react";
import type { SelectionState } from "../../../../state/editorStates";
import type { TransactionResult } from "../../../../commands/editorCommands";
import type { DiagramView, StyleView } from "../../../../views/schema";
import Button from "../../../../ui/primitives/Button/Button";
import ControlGroup from "../../../../ui/templates/ControlGroup/ControlGroup";
import PaneSection from "../../../../ui/templates/PaneSection/PaneSection";
import ChangeStylePalette from "./ChangeStylePalette/ChangeStylePalette";
import SavedStyles from "./SavedStyles/SavedStyles";
import StyleNameEditor from "./StyleNameEditor/StyleNameEditor";
import { useInteractions } from "./useInteractions";

type DiagramEditPaneProps = {
  readonly view: Pick<DiagramView, "styles" | "classes">;
  readonly selectionState: SelectionState;
  readonly onSelectionRestore: (selectionState: SelectionState) => void;
  readonly onStyleSelect: (styleDefId: StyleView["styleId"]) => void;
  readonly onStyleCreateCommitted: (result: TransactionResult) => void;
  readonly onStyleRenameCommitted: (
    result: TransactionResult,
    previousStyleDefId: StyleView["styleId"]
  ) => void;
};

export default function DiagramEditPane({
  view,
  selectionState,
  onSelectionRestore,
  onStyleSelect,
  onStyleCreateCommitted,
  onStyleRenameCommitted,
}: DiagramEditPaneProps): ReactElement {
  // View and State slice props derivation
  const selectedStyle =
    selectionState.kind === "style"
      ? view.styles.find(
          (styleView) =>
            styleView.name !== "default" && styleView.styleId === selectionState.styleDefId
        )
      : undefined;
  const origin = selectionState.kind === "style" ? selectionState.origin : undefined;
  const originClass = origin
    ? view.classes.find((classView) => classView.classId === origin.classIds[0])
    : undefined;

  // Event handler props derivation
  const { onCreate, onBack, onSetAsDefault, onDelete } = useInteractions({
    styles: view.styles,
    selectedStyle,
    origin,
    onSelectionRestore,
    onStyleCreateCommitted,
  });

  return (
    <>
      {origin && originClass ? (
        <Button label={`← ${originClass.header.name}`} onClick={onBack} />
      ) : null}
      <SavedStyles
        view={view.styles}
        selectionState={selectionState}
        onStyleSelect={onStyleSelect}
        onCreate={onCreate}
      />
      {selectedStyle && selectionState.kind === "style" ? (
        <>
          <PaneSection label="Style name">
            <StyleNameEditor
              view={view.styles}
              selectionState={selectionState}
              onRenameCommitted={onStyleRenameCommitted}
            />
          </PaneSection>
          <PaneSection label="Configure style">
            <ChangeStylePalette view={selectedStyle} />
          </PaneSection>
          <PaneSection label="Actions">
            <ControlGroup columns={2}>
              <Button label="Set as default" onClick={onSetAsDefault} />
              <Button label="Delete style" tone="danger" onClick={onDelete} />
            </ControlGroup>
          </PaneSection>
        </>
      ) : null}
    </>
  );
}
