/**
 * @behavior Class resize command dispatch and header blur-discard popup state.
 * @render Class-box node.
 */

import type { ReactElement } from "react";
import { useState } from "react";
import type { CSSProperties } from "react";
import ReactFlowConnectionHandlesAdapter from "./ReactFlowConnectionHandlesAdapter/ReactFlowConnectionHandlesAdapter";
import MemberTable from "./MemberTable/MemberTable";
import { useInteractions } from "./useInteractions";
import BoxOutline from "../../../../../../ui/primitives/BoxOutline/BoxOutline";
import CommitTextField from "../../../../../../ui/composites/CommitTextField/CommitTextField";
import HaloRing from "../../../../../../ui/primitives/HaloRing/HaloRing";
import ResizeAffordance from "../../../../../../ui/primitives/ResizeAffordance/ResizeAffordance";
import type { ResizeHandle } from "../../../../../../ui/primitives/ResizeAffordance/ResizeAffordance";
import type { Point, Rect } from "../../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../../shared/ids";
import type { EditingState } from "../../../../../../state/editorStates";
import type { BaseStyleView, ClassView } from "../../../../../../views/schema";
import ValidationPopup from "../../../../../../ui/primitives/ValidationPopup/ValidationPopup";
import { STYLE_PROPERTIES } from "../../../../../../../shared/style";
import styles from "./ClassBox.module.css";

type ClassBoxProps = {
  readonly view: ClassView;
  readonly baseStyle: BaseStyleView;
  readonly bounds: Rect;
  readonly isSelected: boolean;
  readonly isDragging: boolean;
  readonly isResizeVisible: boolean;
  readonly isConnectSourceEnabled: boolean;
  readonly isPendingMember: boolean;
  readonly haloColor: string | null;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onClassResizeHandlePress: (
    classId: ClassId,
    bounds: Rect,
    handle: ResizeHandle,
    screenPoint: Point
  ) => void;
  readonly editingState: EditingState;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
};

type ConnectionHandleDescriptor = {
  readonly id: string;
  readonly direction: "source" | "target";
  readonly side: "top" | "right" | "bottom" | "left";
};

const CONNECTION_HANDLES: readonly ConnectionHandleDescriptor[] = [
  { id: "top", direction: "source", side: "top" },
  { id: "right", direction: "source", side: "right" },
  { id: "bottom", direction: "source", side: "bottom" },
  { id: "left", direction: "source", side: "left" },
  { id: "target-top", direction: "target", side: "top" },
  { id: "target-right", direction: "target", side: "right" },
  { id: "target-bottom", direction: "target", side: "bottom" },
  { id: "target-left", direction: "target", side: "left" },
];

export default function ClassBox({
  view,
  baseStyle,
  bounds,
  isSelected,
  isDragging,
  isResizeVisible,
  isConnectSourceEnabled,
  isPendingMember,
  haloColor,
  onClassSelect,
  onClassResizeHandlePress,
  editingState,
  onTextBlockEditStart,
  onTextBlockEditCancel,
}: ClassBoxProps): ReactElement {
  // State creation: local state - blur-discard validation messages for header direct edits
  const [headerDiscardErrors, setHeaderDiscardErrors] = useState<readonly string[]>([]);

  // Event handler props derivation
  const { onClassBoxClick, onHeaderCommit } = useInteractions(view.classId, onClassSelect);

  // UI props derivation
  const className = [
    styles.classBox,
    isSelected ? styles.selectedClass : "",
    isDragging ? styles.dragging : "",
  ]
    .filter(Boolean)
    .join(" ");

  const resolvedStyle = Object.fromEntries(
    STYLE_PROPERTIES.flatMap(({ name }) => {
      const value = view.style?.[name] ?? baseStyle[name];
      return value === undefined ? [] : [[name, value]];
    })
  );
  const dynamicVars = {
    "--class-fill": resolvedStyle.fill ?? undefined,
    "--class-stroke": resolvedStyle.stroke ?? undefined,
    "--class-stroke-width": resolvedStyle.strokeWidth ?? undefined,
    "--class-stroke-dasharray": resolvedStyle.strokeDasharray ?? undefined,
    "--class-color": resolvedStyle.color ?? undefined,
  } as CSSProperties;

  const onResizeGrab = (handle: ResizeHandle, point: Point) => {
    onClassResizeHandlePress(view.classId, bounds, handle, point);
  };

  return (
    <div className={className} style={dynamicVars} title={view.classId} onClick={onClassBoxClick}>
      {haloColor ? <HaloRing tint={haloColor} /> : null}
      {isPendingMember ? <BoxOutline variant="pending" /> : null}
      {isSelected ? <BoxOutline variant="selectedStripe" /> : null}
      {isResizeVisible ? (
        <div className="nodrag nopan">
          <ResizeAffordance onGrab={onResizeGrab} />
        </div>
      ) : null}
      <ReactFlowConnectionHandlesAdapter
        handles={CONNECTION_HANDLES}
        className={styles.connectionHandle}
        connectSourceClassName={styles.connectSourceHandle}
        isConnectSourceEnabled={isConnectSourceEnabled}
      />
      <header className={styles.header}>
        {headerDiscardErrors.length > 0 ? (
          <ValidationPopup
            messages={headerDiscardErrors}
            onDismiss={() => setHeaderDiscardErrors([])}
          />
        ) : null}
        {view.header.stereotype ? (
          isHeaderEditing(editingState, view.classId, "annotation") ? (
            <div className="nodrag nopan">
              <CommitTextField
                initialValue={view.header.stereotype}
                validate={(text) => onHeaderCommit("annotation", text.trim() || null)}
                ariaLabel="Annotation"
                isLabelVisible={false}
                autoFocus
                onCommit={onTextBlockEditCancel}
                onDiscard={(messages) => {
                  setHeaderDiscardErrors(messages);
                  onTextBlockEditCancel();
                }}
                onCancel={onTextBlockEditCancel}
              />
            </div>
          ) : (
            <div
              className={styles.stereotype}
              title={view.header.stereotype}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onTextBlockEditStart({
                  kind: "header",
                  classId: view.classId,
                  block: "annotation",
                });
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (isSelected) {
                  onTextBlockEditStart({
                    kind: "header",
                    classId: view.classId,
                    block: "annotation",
                  });
                } else {
                  onClassSelect(view.classId, false);
                }
              }}
            >
              &lt;&lt;{view.header.stereotype}&gt;&gt;
            </div>
          )
        ) : null}
        {isHeaderEditing(editingState, view.classId, "name") ? (
          <div className="nodrag nopan">
            <CommitTextField
              initialValue={view.header.name}
              validate={(text) => onHeaderCommit("name", text.trim())}
              ariaLabel="Class name"
              isLabelVisible={false}
              autoFocus
              onCommit={onTextBlockEditCancel}
              onCancel={onTextBlockEditCancel}
              onDiscard={(messages) => {
                setHeaderDiscardErrors(messages);
                onTextBlockEditCancel();
              }}
            />
          </div>
        ) : (
          <div
            className={styles.className}
            title={view.header.name}
            onDoubleClick={(event) => {
              event.stopPropagation();
              onTextBlockEditStart({ kind: "header", classId: view.classId, block: "name" });
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (isSelected) {
                onTextBlockEditStart({ kind: "header", classId: view.classId, block: "name" });
              } else {
                onClassSelect(view.classId, false);
              }
            }}
          >
            {view.header.name}
          </div>
        )}
        {view.header.label !== view.header.name ? (
          isHeaderEditing(editingState, view.classId, "label") ? (
            <div className="nodrag nopan">
              <CommitTextField
                initialValue={view.header.label}
                validate={(text) => onHeaderCommit("label", text.trim() || null)}
                ariaLabel="Class label"
                isLabelVisible={false}
                autoFocus
                onCommit={onTextBlockEditCancel}
                onCancel={onTextBlockEditCancel}
                onDiscard={(messages) => {
                  setHeaderDiscardErrors(messages);
                  onTextBlockEditCancel();
                }}
              />
            </div>
          ) : (
            <div
              className={styles.classLabel}
              title={view.header.label}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onTextBlockEditStart({ kind: "header", classId: view.classId, block: "label" });
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (isSelected) {
                  onTextBlockEditStart({
                    kind: "header",
                    classId: view.classId,
                    block: "label",
                  });
                } else {
                  onClassSelect(view.classId, false);
                }
              }}
            >
              as {view.header.label}
            </div>
          )
        ) : null}
      </header>
      <MemberTable
        view={{ classId: view.classId, members: view.members }}
        isSelected={isSelected}
        editingState={editingState}
        onTextBlockEditStart={onTextBlockEditStart}
        onTextBlockEditCancel={onTextBlockEditCancel}
        onClassSelect={onClassSelect}
      />
    </div>
  );
}

function isHeaderEditing(
  editingState: EditingState,
  classId: ClassId,
  block: "annotation" | "name" | "label"
): boolean {
  return (
    editingState.kind === "header" &&
    editingState.classId === classId &&
    editingState.block === block
  );
}
