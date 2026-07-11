/**
 * @behavior Namespace selection event routing.
 * @render Namespace hull box.
 */

import { useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import type { NamespaceId } from "../../../../../../../shared/ids";
import type { Point, Rect } from "../../../../../../../shared/geometry";
import type { NamespaceView } from "../../../../../../views/schema";
import type { EditingState } from "../../../../../../state/editorStates";
import type { TransactionResult } from "../../../../../../commands/editorCommands";
import BoxOutline from "../../../../../../ui/primitives/BoxOutline/BoxOutline";
import CommitTextField from "../../../../../../ui/composites/CommitTextField/CommitTextField";
import ValidationPopup from "../../../../../../ui/primitives/ValidationPopup/ValidationPopup";
import ResizeAffordance from "../../../../../../ui/primitives/ResizeAffordance/ResizeAffordance";
import type { ResizeHandle } from "../../../../../../ui/primitives/ResizeAffordance/ResizeAffordance";
import {
  NAMESPACE_NAME_AREA_HEIGHT,
  NAMESPACE_LABEL_FONT_SIZE,
  NAMESPACE_LABEL_FONT_WEIGHT,
  NAMESPACE_LABEL_LINE_HEIGHT,
  NAMESPACE_LABEL_PADDING_X,
  NAMESPACE_LABEL_PADDING_Y,
  NAMESPACE_DEFAULT_STROKE_WIDTH,
  NAMESPACE_DEFAULT_FILL,
  NAMESPACE_DEFAULT_STROKE,
} from "../../../../../../config/editorUiConfig";
import styles from "./NamespaceBox.module.css";
import { useInteractions } from "./useInteractions";

type NamespaceBoxProps = {
  readonly view: NamespaceView;
  readonly bounds: Rect;
  readonly isSelected: boolean;
  readonly isPendingMember: boolean;
  readonly onNamespaceSelect: (namespaceId: NamespaceId) => void;
  readonly onNamespaceResizeHandlePress: (
    namespaceId: NamespaceId,
    bounds: Rect,
    handle: ResizeHandle,
    screenPoint: Point
  ) => void;
  readonly editingState: EditingState;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
  readonly onNamespaceRenameCommitted: (
    result: TransactionResult,
    previousNamespaceId: NamespaceId
  ) => void;
};

export default function NamespaceBox({
  view,
  bounds,
  isSelected,
  isPendingMember,
  onNamespaceSelect,
  onNamespaceResizeHandlePress,
  editingState,
  onTextBlockEditStart,
  onTextBlockEditCancel,
  onNamespaceRenameCommitted,
}: NamespaceBoxProps): ReactElement {
  // State creation: local state - blur-discard validation messages for namespace name edits
  const [discardErrors, setDiscardErrors] = useState<readonly string[]>([]);

  // UI props derivation
  const className = [styles.namespaceBox].filter(Boolean).join(" ");
  const strokeWidth = toCssLength(
    view.style?.strokeWidth ?? String(NAMESPACE_DEFAULT_STROKE_WIDTH)
  );
  const dynamicVars = {
    "--namespace-name-area-height": `${NAMESPACE_NAME_AREA_HEIGHT}px`,
    "--namespace-label-font-size": `${NAMESPACE_LABEL_FONT_SIZE}px`,
    "--namespace-label-font-weight": NAMESPACE_LABEL_FONT_WEIGHT,
    "--namespace-label-line-height": `${NAMESPACE_LABEL_LINE_HEIGHT}px`,
    "--namespace-label-padding-x": `${NAMESPACE_LABEL_PADDING_X}px`,
    "--namespace-label-padding-y": `${NAMESPACE_LABEL_PADDING_Y}px`,
    "--namespace-fill": view.style?.fill ?? NAMESPACE_DEFAULT_FILL,
    "--namespace-stroke": view.style?.stroke ?? NAMESPACE_DEFAULT_STROKE,
    "--namespace-stroke-width": strokeWidth,
    "--namespace-stroke-style": toCssLineStyle(view.style?.strokeDasharray),
    "--namespace-color": view.style?.color ?? undefined,
    "--shiny-inline-surface": view.style?.fill ?? NAMESPACE_DEFAULT_FILL,
    "--shiny-box-selection-center-offset": `calc(${strokeWidth} + 2px)`,
  } as CSSProperties;

  // Event handler props derivation
  const { onNamespaceClick, onNamespacePress, onLabelClick, onLabelDoubleClick, onNameCommit } =
    useInteractions({
      namespaceId: view.namespaceId,
      isSelected,
      onNamespaceSelect,
      onTextBlockEditStart,
      onTextBlockEditCancel,
      onNamespaceRenameCommitted,
    });
  const onResizeGrab = (handle: ResizeHandle, point: Point) => {
    onNamespaceResizeHandlePress(view.namespaceId, bounds, handle, point);
  };

  return (
    <div
      className={className}
      style={dynamicVars}
      title={view.namespaceId}
      onMouseDown={onNamespacePress}
      onClick={onNamespaceClick}
    >
      {discardErrors.length > 0 ? (
        <ValidationPopup messages={discardErrors} onDismiss={() => setDiscardErrors([])} />
      ) : null}
      {editingState.kind === "namespaceName" && editingState.namespaceId === view.namespaceId ? (
        <div className={`${styles.namespaceName} ${styles.inlineEditor} nodrag nopan`}>
          <CommitTextField
            initialValue={view.label}
            validate={onNameCommit}
            ariaLabel="Namespace name"
            isLabelVisible={false}
            autoFocus
            appearance="inline"
            onCommit={onTextBlockEditCancel}
            onDiscard={(messages) => {
              setDiscardErrors(messages);
              onTextBlockEditCancel();
            }}
            onCancel={onTextBlockEditCancel}
          />
        </div>
      ) : (
        <div
          className={styles.namespaceName}
          onClick={onLabelClick}
          onDoubleClick={onLabelDoubleClick}
        >
          {view.label}
        </div>
      )}
      {isPendingMember ? <BoxOutline variant="pending" /> : null}
      {isSelected ? <BoxOutline variant="selected" /> : <BoxOutline variant="hover" />}
      {isSelected ? (
        <div className="nodrag nopan">
          <ResizeAffordance onGrab={onResizeGrab} />
        </div>
      ) : null}
    </div>
  );
}

function toCssLength(value: string): string {
  return /^-?(?:\d+|\d*\.\d+)$/.test(value.trim()) ? `${value.trim()}px` : value;
}

function toCssLineStyle(value: string | null | undefined): "solid" | "dashed" | "dotted" {
  const normalized = value?.trim().replace(/\s+/g, " ");
  if (!normalized || normalized === "0" || normalized === "none") return "solid";
  return normalized.startsWith("1 ") ? "dotted" : "dashed";
}
