/**
 * @fileoverview Translates `note.delete`.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import { deleteNotePair } from "../placement/notePairPlacement";
import type { WriteIntent } from "../writeIntent";

export function translateNoteDelete(
  command: EditorCommandOf<"note.delete">,
  provenance: ProvenanceIndex
): WriteIntent[] {
  return deleteNotePair(command.noteId, provenance.noteAnnotations.has(command.noteId));
}
