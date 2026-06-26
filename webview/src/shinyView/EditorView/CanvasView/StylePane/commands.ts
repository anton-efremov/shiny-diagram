/**
 * @fileoverview Editor command transactions derived by the class style inspector.
 */

import type { ClassId } from "../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../commands/editorCommands";
import type { ClassBoxView } from "../ClassDiagram/views";

const DUPLICATE_OFFSET = 24;

// @job logic:command:derive
export function toFillColorSetTransaction(
  selectedClassIds: readonly ClassId[],
  fillColor: string
): EditorCommandTransaction | null {
  if (selectedClassIds.length === 0) return null;
  return selectedClassIds.map((classId) => ({
    type: "class.style.fillColor.set",
    classId,
    fillColor,
  }));
}

// @job logic:command:derive
export function toBorderColorSetTransaction(
  selectedClassIds: readonly ClassId[],
  borderColor: string
): EditorCommandTransaction | null {
  if (selectedClassIds.length === 0) return null;
  return selectedClassIds.map((classId) => ({
    type: "class.style.borderColor.set",
    classId,
    borderColor,
  }));
}

// @job logic:command:derive
export function toTextColorSetTransaction(
  selectedClassIds: readonly ClassId[],
  textColor: string
): EditorCommandTransaction | null {
  if (selectedClassIds.length === 0) return null;
  return selectedClassIds.map((classId) => ({
    type: "class.style.textColor.set",
    classId,
    textColor,
  }));
}

export function toClassDuplicateTransaction(
  selectedClassViews: readonly ClassBoxView[]
): EditorCommandTransaction | null {
  if (selectedClassViews.length === 0) return null;
  return selectedClassViews.map((classView) => ({
    type: "class.duplicate",
    sourceClassId: classView.classId,
    position: { x: classView.x + DUPLICATE_OFFSET, y: classView.y + DUPLICATE_OFFSET },
    size: { width: classView.w, height: classView.h },
  }));
}
