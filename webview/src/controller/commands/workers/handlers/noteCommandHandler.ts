/**
 * @fileoverview Handles View note editing commands.
 */

import type { NoteCommand } from "../../../../view/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";

/**
 * Handles note commands that are not implemented yet.
 */
export function handleNoteCommand(command: NoteCommand, context: CommandContext): CommandResult {
  void context;
  return { ok: false, problem: `Command ${command.type} is not yet implemented` };
}
