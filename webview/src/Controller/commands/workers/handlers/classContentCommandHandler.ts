/**
 * @fileoverview Handles View class header and member editing commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";

type ClassContentCommand =
  | EditorCommandOf<"class.label.set">
  | EditorCommandOf<"class.name.set">
  | EditorCommandOf<"class.genericType.set">
  | EditorCommandOf<"class.annotation.set">
  | EditorCommandOf<"class.parentNamespace.set">
  | EditorCommandOf<"class.interaction.set">
  | EditorCommandOf<"class.attribute.create">
  | EditorCommandOf<"class.attribute.delete">
  | EditorCommandOf<"class.attribute.move">
  | EditorCommandOf<"class.attribute.name.set">
  | EditorCommandOf<"class.attribute.visibility.set">
  | EditorCommandOf<"class.attribute.type.set">
  | EditorCommandOf<"class.attribute.static.set">
  | EditorCommandOf<"class.method.create">
  | EditorCommandOf<"class.method.delete">
  | EditorCommandOf<"class.method.move">
  | EditorCommandOf<"class.method.name.set">
  | EditorCommandOf<"class.method.visibility.set">
  | EditorCommandOf<"class.method.parameters.set">
  | EditorCommandOf<"class.method.returnType.set">
  | EditorCommandOf<"class.method.static.set">
  | EditorCommandOf<"class.method.abstract.set">
  | EditorCommandOf<"class.lollipopInterface.create">
  | EditorCommandOf<"class.lollipopInterface.delete">
  | EditorCommandOf<"class.lollipopInterface.move">
  | EditorCommandOf<"class.lollipopInterface.label.set">
  | EditorCommandOf<"class.lollipopInterface.side.set">;

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
