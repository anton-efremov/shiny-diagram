/**
 * @behavior Class creation transaction derivation from placement rectangle.
 */

import type { Rect } from "../../../../../../../shared/geometry";
import type { EditorCommandTransaction } from "../../../../../../commands/editorCommands";

// Implementing interaction through command transaction
export function toClassCreateTransaction(rect: Rect): EditorCommandTransaction {
  return [
    {
      type: "class.create",
      parentNamespaceId: null,
      spatial: {
        position: { x: rect.x, y: rect.y },
        size: { width: rect.w, height: rect.h },
      },
    },
  ];
}
