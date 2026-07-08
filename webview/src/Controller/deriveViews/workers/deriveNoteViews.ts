/**
 * @fileoverview Projects Controller note nodes into the View render schema.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { NoteView } from "../../../View/views";

export function deriveNoteViews(model: DiagramGraph): NoteView[] {
  return [...model.notes.values()].map((note) => ({
    noteId: note.id,
    text: note.text,
    bounds: note.spatial
      ? {
          x: note.spatial.position.x,
          y: note.spatial.position.y,
          w: note.spatial.size.width,
          h: note.spatial.size.height,
        }
      : null,
    attachedToClassId: note.attachedToClassId,
  }));
}
