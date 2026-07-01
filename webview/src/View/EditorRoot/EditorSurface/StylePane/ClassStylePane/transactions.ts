/**
 * @behavior Class style edit and class action transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../commands/editorCommands";
import type { ClassView } from "../../../../views/schema";
import { DUPLICATE_OFFSET } from "../../../../config/editorUiConfig";
import type { ClassId } from "../../../../../shared/ids";

// Implementing interaction through command transaction
export function toFillColorSetTransaction(
  selectedClassIds: readonly ClassId[],
  fillColor: string
): EditorCommandTransaction {
  return selectedClassIds.map((classId) => ({
    type: "class.directStyle.property.set",
    classId,
    property: "fill",
    value: fillColor,
  }));
}

export function toBorderColorSetTransaction(
  selectedClassIds: readonly ClassId[],
  borderColor: string
): EditorCommandTransaction {
  return selectedClassIds.map((classId) => ({
    type: "class.directStyle.property.set",
    classId,
    property: "stroke",
    value: borderColor,
  }));
}

export function toClassDeleteTransaction(
  selectedClassIds: readonly ClassId[]
): EditorCommandTransaction {
  return selectedClassIds.map((classId) => ({
    type: "class.delete",
    classId,
  }));
}

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
    size: { width: selectedClass.bounds.w, height: selectedClass.bounds.h },
  }));
}
