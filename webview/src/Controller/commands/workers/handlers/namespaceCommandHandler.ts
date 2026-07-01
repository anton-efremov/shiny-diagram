/**
 * @fileoverview Handles View namespace editing commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";

type NamespaceCommand =
  | EditorCommandOf<"namespace.create">
  | EditorCommandOf<"namespace.delete">
  | EditorCommandOf<"namespace.name.set">
  | EditorCommandOf<"namespace.label.set">
  | EditorCommandOf<"namespace.parentNamespace.set">
  | EditorCommandOf<"namespace.spatial.set">;

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
