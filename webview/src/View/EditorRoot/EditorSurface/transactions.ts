/**
 * @logic CanvasView command transaction derivation from selected class IDs.
 */

import type { ClassId } from "../../../shared/ids";
import type { EditorCommandTransaction } from "../../commands/editorCommands";

/** ── transaction builder area ──
 * Patterns: 4.9-1
 */
export function toClassDeleteTransaction(
  selectedClassIds: readonly ClassId[]
): EditorCommandTransaction {
  return selectedClassIds.map((classId) => ({ type: "class.delete", classId }));
}
