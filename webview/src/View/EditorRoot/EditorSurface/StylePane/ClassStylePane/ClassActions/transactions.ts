/**
 * @behavior Class duplicate and delete transaction derivation.
 */

import { DUPLICATE_OFFSET } from "../../../../../config/editorUiConfig";
import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";
import type { ClassView } from "../../../../../views/schema";

export function toClassDuplicateTransaction(
  selectedClasses: readonly ClassView[]
): EditorCommandTransaction {
  return selectedClasses.map((selectedClass) => ({
    type: "class.duplicate",
    sourceClassId: selectedClass.classId,
    position: {
      x: selectedClass.bounds.x + DUPLICATE_OFFSET,
      y: selectedClass.bounds.y + DUPLICATE_OFFSET,
    },
  }));
}

export function toClassDeleteTransaction(
  selectedClasses: readonly ClassView[]
): EditorCommandTransaction {
  return selectedClasses.map((selectedClass) => ({
    type: "class.delete",
    classId: selectedClass.classId,
  }));
}
