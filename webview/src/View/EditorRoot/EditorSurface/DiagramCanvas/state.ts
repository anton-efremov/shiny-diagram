/**
 * @behavior Initial ClassBoxPlacementState and NoteBoxPlacementState from canonical node views.
 */

import {
  DEFAULT_NOTE_HEIGHT,
  DEFAULT_NOTE_WIDTH,
  UNANNOTATED_NOTE_MARGIN,
  UNANNOTATED_NOTE_STACK_GAP,
} from "../../../config/editorUiConfig";
import type { ClassBoxPlacementState, NoteBoxPlacementState } from "../../../state/editorStates";
import type { ClassView, NoteView } from "../../../views/schema";

// State initialization
export function toInitialClassBoxPlacementState(
  classes: readonly ClassView[]
): ClassBoxPlacementState {
  return {
    rectByClassId: new Map(classes.map((c) => [c.classId, c.bounds])),
  };
}

export function toInitialNoteBoxPlacementState(notes: readonly NoteView[]): NoteBoxPlacementState {
  return {
    rectByNoteId: new Map(notes.map((note, index) => [note.noteId, toNoteRect(note, index)])),
  };
}

// Private helpers
function toNoteRect(note: NoteView, index: number) {
  if (note.bounds) return note.bounds;
  return {
    x: UNANNOTATED_NOTE_MARGIN,
    y: UNANNOTATED_NOTE_MARGIN + index * (DEFAULT_NOTE_HEIGHT + UNANNOTATED_NOTE_STACK_GAP),
    w: DEFAULT_NOTE_WIDTH,
    h: DEFAULT_NOTE_HEIGHT,
  };
}
