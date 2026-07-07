/**
 * @behavior Class resize transaction derivation.
 */

import type { Rect } from "../../../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../../../../../commands/editorCommands";

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
