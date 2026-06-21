/**
 * @fileoverview Handles View class header and member editing commands.
 */

import type { ClassContentCommand } from "../../../../view/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";

/**
 * Handles class content commands that are not implemented yet.
 */
export function handleClassContentCommand(
  command: ClassContentCommand,
  context: CommandContext
): CommandResult {
  void context;
  return { ok: false, problem: `Command ${command.type} is not yet implemented` };
}
