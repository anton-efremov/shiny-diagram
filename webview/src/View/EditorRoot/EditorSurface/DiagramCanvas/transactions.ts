/**
 * @behavior Class and note spatial transaction derivation.
 */

import type { Point, Size } from "../../../../shared/geometry";
import type { ClassId, NoteId } from "../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../commands/editorCommands";

export type ClassMoveEntry = {
  readonly classId: ClassId;
  readonly position: Point;
  readonly size: Size;
};

export type NoteMoveEntry = {
  readonly noteId: NoteId;
  readonly position: Point;
  readonly size: Size;
};

// Implementing interaction through command transaction
export function toClassMoveTransaction(moves: readonly ClassMoveEntry[]): EditorCommandTransaction {
  return moves.map((move) => ({
    type: "class.spatial.set",
    classId: move.classId,
    spatial: {
      position: move.position,
      size: move.size,
    },
  }));
}

export function toNoteMoveTransaction(moves: readonly NoteMoveEntry[]): EditorCommandTransaction {
  return moves.map((move) => ({
    type: "note.spatial.set",
    noteId: move.noteId,
    spatial: {
      position: move.position,
      size: move.size,
    },
  }));
}
