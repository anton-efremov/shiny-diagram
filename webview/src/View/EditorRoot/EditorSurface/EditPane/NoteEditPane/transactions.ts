/**
 * @behavior Note action transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../commands/editorCommands";
import type { NoteView } from "../../../../views/schema";

export function toNoteDetachTransaction(view: NoteView): EditorCommandTransaction {
  return [{ type: "note.attachment.set", noteId: view.noteId, attachedToClassId: null }];
}

export function toNoteDuplicateTransaction(view: NoteView): EditorCommandTransaction {
  return [{ type: "note.duplicate", noteId: view.noteId }];
}

export function toNoteDeleteTransaction(view: NoteView): EditorCommandTransaction {
  return [{ type: "note.delete", noteId: view.noteId }];
}
