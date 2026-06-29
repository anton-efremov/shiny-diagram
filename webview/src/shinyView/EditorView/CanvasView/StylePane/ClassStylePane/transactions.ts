/**
 * @logic ClassStylePane command transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../commands/editorCommands";
import type { ClassView } from "../../../../views/schema";
import { DUPLICATE_OFFSET } from "../../../../config/editorUiConfig";

/** ── transaction builder area ──
 * Patterns: 4.9-1
 */
export function toFillColorSetTransaction(
  selectedClasses: readonly ClassView[],
  fillColor: string
): EditorCommandTransaction {
  return selectedClasses.map((selectedClass) => ({
    type: "class.style.fillColor.set",
    classId: selectedClass.classId,
    fillColor,
  }));
}

export function toBorderColorSetTransaction(
  selectedClasses: readonly ClassView[],
  borderColor: string
): EditorCommandTransaction {
  return selectedClasses.map((selectedClass) => ({
    type: "class.style.borderColor.set",
    classId: selectedClass.classId,
    borderColor,
  }));
}

export function toTextColorSetTransaction(
  selectedClasses: readonly ClassView[],
  textColor: string
): EditorCommandTransaction {
  return selectedClasses.map((selectedClass) => ({
    type: "class.style.textColor.set",
    classId: selectedClass.classId,
    textColor,
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
