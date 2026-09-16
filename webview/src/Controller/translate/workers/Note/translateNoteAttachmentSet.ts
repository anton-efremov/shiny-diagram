/**
 * @fileoverview Translates `note.attachment.set`.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import { noteReplacementAnchor } from "../../placement/noteAttachmentPlacement";
import { composeNoteStatement } from "../../syntax/noteSyntax";
import type { WriteIntent } from "../../writeIntent";

/**
 * Makes two writes:
 *
 * 1. new note **statement**, in **diagram body**
 *    - at the old location, immediately after the bound note annotation statement when it
 *      exists
 * 2. old note **statement** deleted
 *
 * Errors when the note or requested attachment class is missing.
 */
export function translateNoteAttachmentSet(
  command: EditorCommandOf<"note.attachment.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const note = graph.notes.get(command.noteId);
  if (!note) throw new Error(`Note ${command.noteId} does not exist`);
  if (command.attachedToClassId && !graph.classes.has(command.attachedToClassId)) {
    throw new Error(`Class ${command.attachedToClassId} does not exist`);
  }

  return [
    {
      kind: "insertStatement",
      payload: composeNoteStatement({
        text: note.text,
        attachedToClassId: command.attachedToClassId,
      }),
      anchor: noteReplacementAnchor(command.noteId, provenance),
    },
    { kind: "deleteStatement", target: { kind: "note", noteId: command.noteId } },
  ];
}
