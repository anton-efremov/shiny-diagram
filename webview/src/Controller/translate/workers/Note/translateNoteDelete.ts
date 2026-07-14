/**
 * @fileoverview Translates `note.delete`.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import { deleteNotePair } from "../../placement/notePairPlacement";
import type { WriteIntent } from "../../writeIntent";

/**
 * Makes two groups of writes — the note always; its bound annotation only where it exists:
 *
 * 1. note annotation **statement** deleted
 * 2. note **statement** deleted
 */
export function translateNoteDelete(
  command: EditorCommandOf<"note.delete">,
  provenance: ProvenanceIndex
): WriteIntent[] {
  return deleteNotePair(command.noteId, provenance.noteAnnotations.has(command.noteId));
}
