/**
 * @fileoverview Handles View namespace editing commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";

type NamespaceCommand =
  | EditorCommandOf<"namespace.style.fillColor.set">
  | EditorCommandOf<"namespace.style.borderColor.set">
  | EditorCommandOf<"namespace.style.textColor.set">
  | EditorCommandOf<"namespace.style.borderWidth.set">
  | EditorCommandOf<"namespace.style.borderDashPattern.set">;

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
