/**
 * @fileoverview Handles View class header and member editing commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";

type ClassContentCommand =
  | EditorCommandOf<"class.label.set">
  | EditorCommandOf<"class.member.text.set">
  | EditorCommandOf<"class.member.prefix.set">;

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
