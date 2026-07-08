/**
 * @behavior Class resize transaction derivation.
 */

import type { Rect } from "../../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../../shared/ids";
import type { ClassAnnotation } from "../../../../../../../shared/uml";
import type { EditorCommandTransaction } from "../../../../../../commands/editorCommands";

// Implementing interaction through command transaction
export function toClassResizeTransaction(classId: ClassId, rect: Rect): EditorCommandTransaction {
  return [
    {
      type: "class.spatial.set",
      classId,
      spatial: {
        position: { x: rect.x, y: rect.y },
        size: { width: rect.w, height: rect.h },
      },
    },
  ];
}

export function toClassHeaderCommitTransaction(
  classId: ClassId,
  block: "annotation" | "name" | "label",
  value: string | null
): EditorCommandTransaction {
  switch (block) {
    case "annotation":
      return [
        { type: "class.annotation.set", classId, annotation: value as ClassAnnotation | null },
      ];
    case "name":
      return [{ type: "class.name.set", classId, name: value ?? "" }];
    case "label":
      return [{ type: "class.label.set", classId, label: value }];
  }
}
