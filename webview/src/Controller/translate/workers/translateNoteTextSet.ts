/**
 * @fileoverview Translates `note.text.set`.
 */

import type { EditorCommandOf } from "../../../View/commands";
import { escapeNoteText } from "../syntax/noteSyntax";
import type { WriteIntent } from "../writeIntent";

export function translateNoteTextSet(command: EditorCommandOf<"note.text.set">): WriteIntent[] {
  return [
    {
      kind: "replaceValue",
      target: { kind: "noteText", noteId: command.noteId },
      payload: escapeNoteText(command.text),
    },
  ];
}
