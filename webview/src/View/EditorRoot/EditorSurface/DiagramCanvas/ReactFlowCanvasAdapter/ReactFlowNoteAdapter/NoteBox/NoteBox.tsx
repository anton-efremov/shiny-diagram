/**
 * @behavior Note selection, direct editing, and blur-discard popup state.
 * @render Note-box node.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { Point, Rect } from "../../../../../../../shared/geometry";
import type { NoteId } from "../../../../../../../shared/ids";
import type { EditingState } from "../../../../../../state/editorStates";
import BoxInteractionOverlay from "../../../../../../../ui/canvas/composites/BoxInteractionOverlay/BoxInteractionOverlay";
import type { ResizeHandle } from "../../../../../../../ui/canvas/composites/BoxInteractionOverlay/BoxInteractionOverlay";
import InlineCommitTextArea from "../../../../../../../ui/canvas/composites/InlineCommitTextArea/InlineCommitTextArea";
import StickyNoteSurfaceFrame from "../../../../../../../ui/canvas/templates/StickyNoteSurfaceFrame/StickyNoteSurfaceFrame";
import InlineValidationPopup from "../../../../../../../ui/canvas/primitives/InlineValidationPopup/InlineValidationPopup";
import type { NoteView } from "../../../../../../views/schema";
import {
  INLINE_VALIDATION_POPUP_Z_INDEX,
  NODE_ABOVE_CONTENT_Z_INDEX,
  NODE_BEHIND_CONTENT_Z_INDEX,
} from "../../../../../../config/editorUiConfig";
import { useInteractions } from "./useInteractions";

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
    <StickyNoteSurfaceFrame title={view.text} dragging={isDragging} onClick={onNoteBoxClick}>
      <BoxInteractionOverlay
        selected={isSelected}
        pending={false}
        resizeVisible={isResizeVisible}
        haloStacking={NODE_BEHIND_CONTENT_Z_INDEX}
        affordanceStacking={NODE_ABOVE_CONTENT_Z_INDEX}
        onResizeGrab={onResizeGrab}
      />
      {discardErrors.length > 0 ? (
        <InlineValidationPopup
          messages={discardErrors}
          stacking={INLINE_VALIDATION_POPUP_Z_INDEX}
          onDismiss={onDiscardDismiss}
        />
      ) : null}
      <InlineCommitTextArea
        initialValue={view.text.trim()}
        displayText={view.text}
        isEditing={isEditing}
        autoFocus
        saveLabel="Save"
        onEditRequest={isSelected ? onNoteTextDoubleClick : onNoteTextClick}
        onCommit={(text) => {
          const errors = onTextCommit(text.trim());
          if (errors.length > 0) onTextDiscard(errors);
        }}
        onCancel={onTextCancel}
      />
    </StickyNoteSurfaceFrame>
  );
}
