/**
 * @behavior Note selection, direct editing, and blur-discard popup state.
 * @render Note-box node.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { NoteId } from "../../../../../../../shared/ids";
import type { EditingState } from "../../../../../../state/editorStates";
import ValidationPopup from "../../../../../../ui/ValidationPopup/ValidationPopup";
import type { NoteView } from "../../../../../../views/schema";
import NoteEditField from "./NoteEditField/NoteEditField";
import { useInteractions } from "./useInteractions";
import styles from "./NoteBox.module.css";

type NoteBoxProps = {
  readonly view: NoteView;
  readonly isSelected: boolean;
  readonly isDragging: boolean;
  readonly editingState: EditingState;
  readonly onNoteSelect: (noteId: NoteId) => void;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
};

export default function NoteBox({
  view,
  isSelected,
  isDragging,
  editingState,
  onNoteSelect,
  onTextBlockEditStart,
  onTextBlockEditCancel,
}: NoteBoxProps): ReactElement {
  // State creation: local state - blur-discard validation messages for note text edits
  const [discardErrors, setDiscardErrors] = useState<readonly string[]>([]);

  // UI props derivation
  const className = [
    styles.noteBox,
    isSelected ? styles.selected : "",
    isDragging ? styles.dragging : "",
  ]
    .filter(Boolean)
    .join(" ");
  const isEditing = editingState.kind === "noteText" && editingState.noteId === view.noteId;
  const isNewBlankNote = view.text.trim() === "";

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
      {discardErrors.length > 0 ? (
        <ValidationPopup messages={discardErrors} onDismiss={onDiscardDismiss} />
      ) : null}
      {isEditing ? (
        <NoteEditField
          initialText={view.text}
          onCommit={onTextCommit}
          onCancel={onTextCancel}
          onEditDiscard={onTextDiscard}
        />
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
