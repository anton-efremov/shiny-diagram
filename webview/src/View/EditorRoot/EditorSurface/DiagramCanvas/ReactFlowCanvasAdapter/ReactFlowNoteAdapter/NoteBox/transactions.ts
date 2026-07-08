/**
 * @behavior Note text commit and delete transaction derivation.
 */

import type { NoteId } from "../../../../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../../../../commands/editorCommands";

export function toNoteTextCommitTransaction(
  noteId: NoteId,
  text: string
): EditorCommandTransaction {
  return text === ""
    ? [{ type: "note.delete", noteId }]
    : [{ type: "note.text.set", noteId, text }];
}

export function toNoteDeleteTransaction(noteId: NoteId): EditorCommandTransaction {
  return [{ type: "note.delete", noteId }];
}
