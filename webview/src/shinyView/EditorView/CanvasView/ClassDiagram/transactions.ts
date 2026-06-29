/**
 * @logic ClassDiagram command transaction derivation.
 */

import type { Point } from "../../../../shared/geometry";
import type { ClassId } from "../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../commands/editorCommands";

export type ClassMoveEntry = {
  readonly classId: ClassId;
  readonly position: Point;
};

/** ── transaction builder area ──
 * Patterns: 4.9-1
 */
export function toClassMoveTransaction(moves: readonly ClassMoveEntry[]): EditorCommandTransaction {
  return moves.map((move) => ({
    type: "class.position.set",
    classId: move.classId,
    position: move.position,
  }));
}
