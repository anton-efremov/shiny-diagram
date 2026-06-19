/**
 * @fileoverview Handles relationship editing commands.
 */

import type { RelationshipCommand } from "../../editorCommand";
import type { CommandContext, CommandResult } from "../../commandExecution";

/**
 * Handles relationship commands that are not implemented yet.
 */
export function handleRelationshipCommand(
  command: RelationshipCommand,
  context: CommandContext
): CommandResult {
  void context;
  return { ok: false, problem: `Command ${command.type} is not yet implemented` };
}
