/**
 * @behavior Diagram style management and selected-style section routing.
 * @render Saved styles and named style inspector sections.
 */

import type { ReactElement } from "react";
import type { SelectionState } from "../../../../state/editorStates";
import type { TransactionResult } from "../../../../commands/editorCommands";
import type { DeclaredStyleView, DiagramView } from "../../../../views/schema";
import Button from "../../../../ui/primitives/Button/Button";
import BackAffordance from "../../../../ui/primitives/BackAffordance/BackAffordance";
import ControlGroup from "../../../../ui/templates/ControlGroup/ControlGroup";
import PaneSection from "../../../../ui/templates/PaneSection/PaneSection";
import ChangeStylePalette from "./ChangeStylePalette/ChangeStylePalette";
import SavedStyles from "./SavedStyles/SavedStyles";
import StyleNameEditor from "./StyleNameEditor/StyleNameEditor";
import { useInteractions } from "./useInteractions";
import { COLOR_PRESETS } from "../../../../config/stylePresets";
import {
  CLASS_DEFAULT_STROKE_WIDTH,
  DEFAULT_STROKE_DASHARRAY,
} from "../../../../config/editorUiConfig";
import { toDocumentColors, toStrokeSelectUIProps } from "./childProps";

type DiagramEditPaneProps = {
  readonly view: Pick<DiagramView, "styles">;
  readonly selectionState: SelectionState;
  readonly onSelectionRestore: (selectionState: SelectionState) => void;
  readonly onStyleSelect: (styleDefId: DeclaredStyleView["styleDefId"]) => void;
  readonly onStyleCreateCommitted: (result: TransactionResult) => void;
  readonly onStyleRenameCommitted: (
    result: TransactionResult,
    previousStyleDefId: DeclaredStyleView["styleDefId"]
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
  const declaredStyles = view.styles.filter((styleView) => styleView.kind === "declared");
  const selectedStyle =
    selectionState.kind === "style"
      ? declaredStyles.find(
          (styleView) =>
            styleView.name !== "default" && styleView.styleDefId === selectionState.styleDefId
        )
      : undefined;
  const origin = selectionState.kind === "style" ? selectionState.origin : undefined;

  // UI props derivation
  const documentColors = toDocumentColors(view.styles);
  const widthSelectUIProps = toStrokeSelectUIProps(
    view.styles,
    "strokeWidth",
    CLASS_DEFAULT_STROKE_WIDTH
  );
  const dashSelectUIProps = toStrokeSelectUIProps(
    view.styles,
    "strokeDasharray",
    DEFAULT_STROKE_DASHARRAY
  );

  // Event handler props derivation
  const { onCreate, onBack, onSetAsDefault, onDelete } = useInteractions({
    styles: declaredStyles,
    selectedStyle,
    origin,
    onSelectionRestore,
    onStyleCreateCommitted,
  });

  return (
    <>
      <BackAffordance label="← Back" visible={origin !== undefined} onClick={onBack} />
      <SavedStyles
        view={declaredStyles}
        selectionState={selectionState}
        onStyleSelect={onStyleSelect}
        onCreate={onCreate}
      />
      {selectedStyle && selectionState.kind === "style" ? (
        <>
          <PaneSection label="Edit style">
            <StyleNameEditor
              view={declaredStyles}
              selectionState={selectionState}
              onRenameCommitted={onStyleRenameCommitted}
            />
            <ChangeStylePalette
              view={selectedStyle}
              presets={COLOR_PRESETS}
              documentColors={documentColors}
              widthSelectUIProps={widthSelectUIProps}
              dashSelectUIProps={dashSelectUIProps}
            />
          </PaneSection>
          <PaneSection label="Actions">
            <ControlGroup>
              <Button label="Set as default" onClick={onSetAsDefault} />
              <Button label="Delete style" tone="danger" onClick={onDelete} />
            </ControlGroup>
          </PaneSection>
        </>
      ) : null}
    </>
  );
}
