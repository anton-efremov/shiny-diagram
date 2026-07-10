/**
 * @behavior Namespace name, style property, reset, and delete requests.
 * @render Namespace edit pane sections.
 */

import type { ReactElement } from "react";
import type { NamespaceId } from "../../../../../shared/ids";
import { STYLE_PROPERTIES, type StyleProperties } from "../../../../../shared/style";
import type { TransactionResult } from "../../../../commands/editorCommands";
import type { SelectionState } from "../../../../state/editorStates";
import Button from "../../../../ui/primitives/Button/Button";
import CommitTextField from "../../../../ui/composites/CommitTextField/CommitTextField";
import { COLOR_PRESETS } from "../../../../config/stylePresets";
import {
  DEFAULT_STROKE_DASHARRAY,
  NAMESPACE_DEFAULT_STROKE_WIDTH,
} from "../../../../config/editorUiConfig";
import StyledBoxSwatch from "../../../../ui/primitives/StyledBoxSwatch/StyledBoxSwatch";
import PaneSection from "../../../../ui/templates/PaneSection/PaneSection";
import FieldGrid from "../../../../ui/templates/FieldGrid/FieldGrid";
import type { DiagramView } from "../../../../views/schema";
import { toDocumentColors, toSelectedNamespace, toStrokeSelectUIProps } from "./childProps";
import { useInteractions } from "./useInteractions";
import StylePropertyControl from "./StylePropertyControl/StylePropertyControl";

type NamespaceEditPaneProps = {
  readonly view: Pick<DiagramView, "namespaces" | "styles">;
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
    "strokeWidth",
    `${NAMESPACE_DEFAULT_STROKE_WIDTH}px`
  );
  const dashSelectUIProps = toStrokeSelectUIProps(
    view.styles,
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
      <PaneSection label="Selected namespace">
        <StyledBoxSwatch styleValues={style} label={selectedNamespace.label} />
        <CommitTextField
          initialValue={selectedNamespace.label}
          validate={() => []}
          ariaLabel="Namespace name"
          onCommit={onNameCommit}
          onDiscard={() => undefined}
          onCancel={() => undefined}
        />
      </PaneSection>
      <PaneSection label="Namespace style">
        <FieldGrid
          labelWidth="standard"
          rows={STYLE_PROPERTIES.map(({ name }) => ({
            label: toPropertyLabel(name),
            control: (
              <StylePropertyControl
                property={name}
                value={style[name]}
                presets={COLOR_PRESETS}
                documentColors={documentColors}
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
        <Button label="Reset style" disabled={selectedNamespace.style === null} onClick={onReset} />
      </PaneSection>
      <PaneSection label="">
        <Button label="Delete" tone="danger" onClick={onDelete} />
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
      return "Stroke width";
    case "strokeDasharray":
      return "Stroke dasharray";
    case "color":
      return "Text";
  }
}
