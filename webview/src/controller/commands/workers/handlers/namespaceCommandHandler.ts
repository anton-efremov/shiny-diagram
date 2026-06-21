/**
 * @fileoverview Handles View namespace editing commands.
 */

import type { NamespaceCommand } from "../../../../view/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";

/**
 * Handles namespace commands that are not implemented yet.
 */
export function handleNamespaceCommand(
  command: NamespaceCommand,
  context: CommandContext
): CommandResult {
  void context;
  return { ok: false, problem: `Command ${command.type} is not yet implemented` };
}
