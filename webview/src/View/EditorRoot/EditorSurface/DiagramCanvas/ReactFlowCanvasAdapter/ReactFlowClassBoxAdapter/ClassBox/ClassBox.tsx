/**
 * @behavior Class resize command dispatch and header blur-discard popup state.
 * @render Class-box node.
 */

import type { ReactElement } from "react";
import { useState } from "react";
import type { CSSProperties } from "react";
import ReactFlowConnectionHandlesAdapter from "./ReactFlowConnectionHandlesAdapter/ReactFlowConnectionHandlesAdapter";
import ReactFlowNodeResizerAdapter from "./ReactFlowNodeResizerAdapter/ReactFlowNodeResizerAdapter";
import HeaderEditField from "./HeaderEditField/HeaderEditField";
import MemberTable from "./MemberTable/MemberTable";
import { useInteractions } from "./useInteractions";
import type { ClassId } from "../../../../../../../shared/ids";
import type { EditingState } from "../../../../../../state/editorStates";
import type { ClassView } from "../../../../../../views/schema";
import ValidationPopup from "../../../../../../ui/ValidationPopup/ValidationPopup";
import styles from "./ClassBox.module.css";

type ClassBoxProps = {
  readonly view: ClassView;
  readonly isSelected: boolean;
  readonly isDragging: boolean;
  readonly isResizeVisible: boolean;
  readonly isConnectSourceEnabled: boolean;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
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
  isSelected,
  isDragging,
  isResizeVisible,
  isConnectSourceEnabled,
  onClassSelect,
  editingState,
  onTextBlockEditStart,
  onTextBlockEditCancel,
}: ClassBoxProps): ReactElement {
  // State creation: local state - blur-discard validation messages for header direct edits
  const [headerDiscardErrors, setHeaderDiscardErrors] = useState<readonly string[]>([]);

  // Event handler props derivation
  const { onClassBoxClick, onResizeEnd, onHeaderCommit } = useInteractions(
    view.classId,
    onClassSelect
  );

  // UI props derivation
  const className = [
    styles.classBox,
    isSelected ? styles.selected : "",
    isDragging ? styles.dragging : "",
  ]
    .filter(Boolean)
    .join(" ");

  const dynamicVars = view.style
    ? ({
        "--class-fill": view.style.fill ?? undefined,
        "--class-stroke": view.style.stroke ?? undefined,
        "--class-stroke-width": view.style.strokeWidth ?? undefined,
        "--class-stroke-dasharray": view.style.strokeDasharray ?? undefined,
        "--class-color": view.style.color ?? undefined,
      } as CSSProperties)
    : undefined;

  return (
    <div className={className} style={dynamicVars} title={view.classId} onClick={onClassBoxClick}>
      <ReactFlowNodeResizerAdapter
        nodeId={view.classId}
        isVisible={isResizeVisible}
        minWidth={80}
        minHeight={48}
        handleClassName={styles.resizeHandle}
        lineClassName={styles.resizeLine}
        onResizeEnd={onResizeEnd}
      />
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
            <HeaderEditField
              initialText={view.header.stereotype}
              onCommit={(text) => {
                const errors = onHeaderCommit("annotation", text || null);
                if (errors.length === 0) onTextBlockEditCancel();
                return errors;
              }}
              onCancel={onTextBlockEditCancel}
              onEditDiscard={(messages) => {
                setHeaderDiscardErrors(messages);
                onTextBlockEditCancel();
              }}
            />
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
          <HeaderEditField
            initialText={view.header.name}
            onCommit={(text) => {
              const errors = onHeaderCommit("name", text);
              if (errors.length === 0) onTextBlockEditCancel();
              return errors;
            }}
            onCancel={onTextBlockEditCancel}
            onEditDiscard={(messages) => {
              setHeaderDiscardErrors(messages);
              onTextBlockEditCancel();
            }}
          />
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
            <HeaderEditField
              initialText={view.header.label}
              onCommit={(text) => {
                const errors = onHeaderCommit("label", text || null);
                if (errors.length === 0) onTextBlockEditCancel();
                return errors;
              }}
              onCancel={onTextBlockEditCancel}
              onEditDiscard={(messages) => {
                setHeaderDiscardErrors(messages);
                onTextBlockEditCancel();
              }}
            />
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
