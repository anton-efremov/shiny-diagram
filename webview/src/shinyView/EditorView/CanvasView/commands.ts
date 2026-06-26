/**
 * @fileoverview Editor command transactions derived from CanvasView selection state.
 */

import type { ClassId } from "../../../shared/ids";
import type { EditorCommandTransaction } from "../../commands/editorCommands";

export function toClassDeleteTransaction(
  selectedClassIds: readonly ClassId[]
): EditorCommandTransaction | null {
  if (selectedClassIds.length === 0) return null;
  return selectedClassIds.map((classId) => ({ type: "class.delete", classId }));
}
