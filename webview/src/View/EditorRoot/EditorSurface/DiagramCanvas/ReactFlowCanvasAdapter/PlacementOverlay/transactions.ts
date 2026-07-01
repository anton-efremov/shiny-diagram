/**
 * @behavior Class creation transaction derivation from placement rectangle.
 */

import type { Rect } from "../../../../../../shared/geometry";
import type { ClassView } from "../../../../../views/schema";
import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";

// Implementing interaction through command transaction
export function toClassCreateTransaction(
  rect: Rect,
  classes: readonly Pick<ClassView, "classId">[]
): EditorCommandTransaction {
  return [
    {
      type: "class.create",
      name: toNextClassName(classes),
      parentNamespaceId: null,
      spatial: {
        position: { x: rect.x, y: rect.y },
        size: { width: rect.w, height: rect.h },
      },
    },
  ];
}

function toNextClassName(classes: readonly Pick<ClassView, "classId">[]): string {
  const existing = new Set(classes.map((classView) => String(classView.classId)));
  if (!existing.has("Class")) return "Class";

  let suffix = 1;
  while (existing.has(`Class${suffix}`)) {
    suffix++;
  }
  return `Class${suffix}`;
}
