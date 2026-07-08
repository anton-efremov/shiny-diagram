/**
 * @behavior Class and note creation transaction derivation from placement facts.
 */

import type { Point, Rect } from "../../../../../../shared/geometry";
import { DEFAULT_NOTE_HEIGHT, DEFAULT_NOTE_WIDTH } from "../../../../../config/editorUiConfig";
import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";

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

export function toNoteCreateTransaction(position: Point): EditorCommandTransaction {
  return [
    {
      type: "note.create",
      text: " ",
      spatial: {
        position,
        size: { width: DEFAULT_NOTE_WIDTH, height: DEFAULT_NOTE_HEIGHT },
      },
      attachedToClassId: null,
    },
  ];
}
