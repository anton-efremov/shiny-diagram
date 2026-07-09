/**
 * @behavior Note selection, direct editing, and blur-discard popup state.
 * @render Note-box node.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { Point, Rect } from "../../../../../../../shared/geometry";
import type { NoteId } from "../../../../../../../shared/ids";
import type { EditingState } from "../../../../../../state/editorStates";
import BoxOutline from "../../../../../../ui/primitives/BoxOutline/BoxOutline";
import CommitTextArea from "../../../../../../ui/composites/CommitTextArea/CommitTextArea";
import ResizeAffordance from "../../../../../../ui/primitives/ResizeAffordance/ResizeAffordance";
import type { ResizeHandle } from "../../../../../../ui/primitives/ResizeAffordance/ResizeAffordance";
import ValidationPopup from "../../../../../../ui/primitives/ValidationPopup/ValidationPopup";
import type { NoteView } from "../../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./NoteBox.module.css";

type NoteBoxProps = {
  readonly view: NoteView;
  readonly bounds: Rect;
  readonly isSelected: boolean;
  readonly isResizeVisible: boolean;
  readonly isDragging: boolean;
  readonly editingState: EditingState;
  readonly onNoteSelect: (noteId: NoteId) => void;
  readonly onNoteResizeHandlePress: (
    noteId: NoteId,
    bounds: Rect,
    handle: ResizeHandle,
    screenPoint: Point
  ) => void;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
};

export default function NoteBox({
  view,
  bounds,
  isSelected,
  isResizeVisible,
  isDragging,
  editingState,
  onNoteSelect,
  onNoteResizeHandlePress,
  onTextBlockEditStart,
  onTextBlockEditCancel,
}: NoteBoxProps): ReactElement {
  // State creation: local state - blur-discard validation messages for note text edits
  const [discardErrors, setDiscardErrors] = useState<readonly string[]>([]);

  // UI props derivation
  const className = [styles.noteBox, isDragging ? styles.dragging : ""].filter(Boolean).join(" ");
  const isEditing = editingState.kind === "noteText" && editingState.noteId === view.noteId;
  const isNewBlankNote = view.text.trim() === "";

  const onResizeGrab = (handle: ResizeHandle, point: Point) => {
    onNoteResizeHandlePress(view.noteId, bounds, handle, point);
  };

  // Event handler props derivation
  const {
    onNoteBoxClick,
    onNoteTextClick,
    onNoteTextDoubleClick,
    onTextCommit,
    onTextCancel,
    onTextDiscard,
    onDiscardDismiss,
  } = useInteractions({
    noteId: view.noteId,
    isSelected,
    isNewBlankNote,
    onNoteSelect,
    onTextBlockEditStart,
    onTextBlockEditCancel,
    setDiscardErrors,
  });

  return (
    <div className={className} title={view.text} onClick={onNoteBoxClick}>
      {isResizeVisible ? (
        <div className="nodrag nopan">
          <ResizeAffordance onGrab={onResizeGrab} />
        </div>
      ) : null}
      {isSelected ? <BoxOutline variant="selected" /> : null}
      {discardErrors.length > 0 ? (
        <ValidationPopup messages={discardErrors} onDismiss={onDiscardDismiss} />
      ) : null}
      {isEditing ? (
        <div className={`${styles.editorHost} nodrag nopan`}>
          <CommitTextArea
            initialValue={view.text.trim()}
            autoFocus
            onCommit={(text) => {
              const errors = onTextCommit(text.trim());
              if (errors.length > 0) onTextDiscard(errors);
            }}
            onCancel={onTextCancel}
          />
        </div>
      ) : (
        <div
          className={styles.text}
          onDoubleClick={onNoteTextDoubleClick}
          onClick={onNoteTextClick}
        >
          {view.text}
        </div>
      )}
    </div>
  );
}
