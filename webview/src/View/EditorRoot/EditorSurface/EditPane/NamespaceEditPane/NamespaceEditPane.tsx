/**
 * @behavior Namespace name, style property, reset, and delete requests.
 * @render Namespace edit pane sections.
 */

import type { ReactElement } from "react";
import type { NamespaceId } from "../../../../../shared/ids";
import { STYLE_PROPERTIES, type StyleProperties } from "../../../../../shared/style";
import type { TransactionResult } from "../../../../commands/editorCommands";
import type { SelectionState } from "../../../../state/editorStates";
import Button from "../../../../../ui/chrome/primitives/Button/Button";
import CommitTextField from "../../../../../ui/chrome/composites/CommitTextField/CommitTextField";
import { COLOR_PRESETS } from "../../../../config/stylePresets";
import {
  CHROME_VALIDATION_ABOVE_CONTROL_Z_INDEX,
  DEFAULT_STROKE_DASHARRAY,
  NAMESPACE_DEFAULT_STROKE_WIDTH,
} from "../../../../config/editorUiConfig";
import PaneSection from "../../../../../ui/chrome/templates/PaneSection/PaneSection";
import FieldGrid from "../../../../../ui/chrome/templates/FieldGrid/FieldGrid";
import ControlGroup from "../../../../../ui/chrome/templates/ControlGroup/ControlGroup";
import type { DiagramView } from "../../../../views/schema";
import { toDocumentColors, toSelectedNamespace, toStrokeSelectUIProps } from "./childProps";
import { useInteractions } from "./useInteractions";
import StylePropertyControl from "./StylePropertyControl/StylePropertyControl";

type NamespaceEditPaneProps = {
  readonly view: Pick<DiagramView, "namespaces" | "styles" | "baseStyle">;
  readonly selectionState: Extract<SelectionState, { readonly kind: "namespace" }>;
  readonly onNamespaceRenameCommitted: (
    result: TransactionResult,
    previousNamespaceId: NamespaceId
  ) => void;
};

const EMPTY_STYLE_PROPERTIES: StyleProperties = {
  fill: null,
  stroke: null,
  strokeWidth: null,
  strokeDasharray: null,
  color: null,
};

export default function NamespaceEditPane({
  view,
  selectionState,
  onNamespaceRenameCommitted,
}: NamespaceEditPaneProps): ReactElement {
  // View and State slice props derivation
  const selectedNamespace = toSelectedNamespace(view.namespaces, selectionState.namespaceId);

  // UI props derivation
  const style = selectedNamespace.style ?? EMPTY_STYLE_PROPERTIES;
  const documentColors = toDocumentColors(view.styles);
  const widthSelectUIProps = toStrokeSelectUIProps(
    view.styles,
    view.baseStyle,
    "strokeWidth",
    `${NAMESPACE_DEFAULT_STROKE_WIDTH}px`
  );
  const dashSelectUIProps = toStrokeSelectUIProps(
    view.styles,
    view.baseStyle,
    "strokeDasharray",
    DEFAULT_STROKE_DASHARRAY
  );

  // Event handler props derivation
  const { onNameCommit, onPropertyChange, onReset, onDelete } = useInteractions({
    view: selectedNamespace,
    onNamespaceRenameCommitted,
  });

  return (
    <>
      <PaneSection label="Namespace name">
        <CommitTextField
          initialValue={selectedNamespace.label}
          validate={onNameCommit}
          ariaLabel="Namespace name"
          isLabelVisible={false}
          validationStacking={CHROME_VALIDATION_ABOVE_CONTROL_Z_INDEX}
          onCommit={() => undefined}
          onDiscard={() => undefined}
          onCancel={() => undefined}
        />
      </PaneSection>
      <PaneSection label="Configure style">
        <FieldGrid
          variant="surfaceStyle"
          rows={STYLE_PROPERTIES.map(({ name }) => ({
            label: toPropertyLabel(name),
            control: (
              <StylePropertyControl
                property={name}
                value={style[name]}
                presets={COLOR_PRESETS}
                documentColors={documentColors}
                baseValue={view.baseStyle[name]}
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
      </PaneSection>
      <PaneSection label="Actions">
        <ControlGroup columns={2}>
          <Button
            label="Reset style"
            disabled={selectedNamespace.style === null}
            onClick={onReset}
          />
          <Button label="Delete" variant="danger" onClick={onDelete} />
        </ControlGroup>
      </PaneSection>
    </>
  );
}

// Private helpers
function toPropertyLabel(property: (typeof STYLE_PROPERTIES)[number]["name"]): string {
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
