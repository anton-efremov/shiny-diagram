/**
 * @fileoverview Handles View note editing commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";

type NoteCommand =
  | EditorCommandOf<"note.create">
  | EditorCommandOf<"note.delete">
  | EditorCommandOf<"note.text.set">
  | EditorCommandOf<"note.spatial.set">;

/**
 * Handles note commands that are not implemented yet.
 */
export function handleNoteCommand(command: NoteCommand, context: CommandContext): CommandResult {
  void context;
  return { ok: false, problem: `Command ${command.type} is not yet implemented` };
}
