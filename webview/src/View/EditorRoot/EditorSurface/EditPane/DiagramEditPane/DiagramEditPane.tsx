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
import TextBlock from "../../../../ui/primitives/TextBlock/TextBlock";
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
import { PURE_STYLE_DEFAULTS } from "../../../../config/stylePresets";

type DiagramEditPaneProps = {
  readonly view: Pick<DiagramView, "styles" | "baseStyle">;
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
  const namedStyles = declaredStyles.filter((styleView) => styleView.name !== "default");
  const materializedBase = declaredStyles.find((styleView) => styleView.name === "default");
  const isBaseSelected = selectionState.kind === "style" && selectionState.styleDefId === "default";
  const selectedStyle =
    selectionState.kind === "style"
      ? namedStyles.find((styleView) => styleView.styleDefId === selectionState.styleDefId)
      : undefined;
  const origin = selectionState.kind === "style" ? selectionState.origin : undefined;

  // UI props derivation
  const documentColors = toDocumentColors(view.styles);
  const widthSelectUIProps = toStrokeSelectUIProps(
    view.styles,
    view.baseStyle,
    "strokeWidth",
    CLASS_DEFAULT_STROKE_WIDTH
  );
  const dashSelectUIProps = toStrokeSelectUIProps(
    view.styles,
    view.baseStyle,
    "strokeDasharray",
    DEFAULT_STROKE_DASHARRAY
  );

  // Event handler props derivation
  const {
    onCreate,
    onBack,
    onSetAsDefault,
    onResetBase,
    onDelete,
    onBasePropertyChange,
    onNamedStylePropertyChange,
  } = useInteractions({
    styles: declaredStyles,
    selectedStyle,
    materializedBase,
    baseStyle: view.baseStyle,
    origin,
    onSelectionRestore,
    onStyleCreateCommitted,
  });

  return (
    <>
      <BackAffordance label="← Back" visible={origin !== undefined} onClick={onBack} />
      <SavedStyles
        view={namedStyles}
        baseStyle={view.baseStyle}
        selectionState={selectionState}
        onStyleSelect={onStyleSelect}
        onCreate={onCreate}
      />
      {isBaseSelected ? (
        <>
          <PaneSection label="Edit base style">
            <TextBlock text="Applies to every class wherever its style does not set a property." />
            <ChangeStylePalette
              view={view.baseStyle}
              presets={COLOR_PRESETS}
              documentColors={documentColors}
              widthSelectUIProps={{
                ...widthSelectUIProps,
                defaultValue: PURE_STYLE_DEFAULTS.strokeWidth,
              }}
              dashSelectUIProps={{
                ...dashSelectUIProps,
                defaultValue: PURE_STYLE_DEFAULTS.strokeDasharray,
              }}
              baseStyle={{}}
              onPropertyChange={onBasePropertyChange}
            />
          </PaneSection>
          <PaneSection label="Actions">
            <Button
              label="Reset base"
              disabled={Object.keys(view.baseStyle).length === 0}
              onClick={onResetBase}
            />
          </PaneSection>
        </>
      ) : null}
      {selectedStyle && selectionState.kind === "style" ? (
        <>
          <PaneSection label="Edit style">
            <StyleNameEditor
              view={namedStyles}
              selectionState={selectionState}
              onRenameCommitted={onStyleRenameCommitted}
            />
            <ChangeStylePalette
              view={selectedStyle.properties}
              presets={COLOR_PRESETS}
              documentColors={documentColors}
              widthSelectUIProps={widthSelectUIProps}
              dashSelectUIProps={dashSelectUIProps}
              baseStyle={view.baseStyle}
              onPropertyChange={onNamedStylePropertyChange}
            />
          </PaneSection>
          <PaneSection label="Actions">
            <ControlGroup columns={2}>
              <Button label="Set as base" onClick={onSetAsDefault} />
              <Button label="Delete style" tone="danger" onClick={onDelete} />
            </ControlGroup>
          </PaneSection>
        </>
      ) : null}
    </>
  );
}
