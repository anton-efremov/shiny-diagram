/**
 * @fileoverview Editor command transactions derived by the class style pane.
 */

import type { EditorCommandTransaction } from "../../../../commands/editorCommands";
import type { ClassStyleTargetView } from "./views";

const DUPLICATE_OFFSET = 24;

// @job logic:command:derive
export function toFillColorSetTransaction(
  selectedClasses: readonly ClassStyleTargetView[],
  fillColor: string
): EditorCommandTransaction | null {
  if (selectedClasses.length === 0) return null;
  return selectedClasses.map((selectedClass) => ({
    type: "class.style.fillColor.set",
    classId: selectedClass.classId,
    fillColor,
  }));
}

// @job logic:command:derive
export function toBorderColorSetTransaction(
  selectedClasses: readonly ClassStyleTargetView[],
  borderColor: string
): EditorCommandTransaction | null {
  if (selectedClasses.length === 0) return null;
  return selectedClasses.map((selectedClass) => ({
    type: "class.style.borderColor.set",
    classId: selectedClass.classId,
    borderColor,
  }));
}

// @job logic:command:derive
export function toTextColorSetTransaction(
  selectedClasses: readonly ClassStyleTargetView[],
  textColor: string
): EditorCommandTransaction | null {
  if (selectedClasses.length === 0) return null;
  return selectedClasses.map((selectedClass) => ({
    type: "class.style.textColor.set",
    classId: selectedClass.classId,
    textColor,
  }));
}

// @job logic:command:derive
export function toClassDeleteTransaction(
  selectedClasses: readonly ClassStyleTargetView[]
): EditorCommandTransaction | null {
  if (selectedClasses.length === 0) return null;
  return selectedClasses.map((selectedClass) => ({
    type: "class.delete",
    classId: selectedClass.classId,
  }));
}

// @job logic:command:derive
export function toClassDuplicateTransaction(
  selectedClasses: readonly ClassStyleTargetView[]
): EditorCommandTransaction | null {
  if (selectedClasses.length === 0) return null;
  return selectedClasses.map((selectedClass) => ({
    type: "class.duplicate",
    sourceClassId: selectedClass.classId,
    position: {
      x: selectedClass.position.x + DUPLICATE_OFFSET,
      y: selectedClass.position.y + DUPLICATE_OFFSET,
    },
    size: selectedClass.size,
  }));
}
