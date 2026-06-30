/**
 * @fileoverview Handles source edits for View class style commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";
import { planClassStyleMutation } from "../styleMutationPlanning";

type ClassStyleCommand =
  | EditorCommandOf<"class.style.fillColor.set">
  | EditorCommandOf<"class.style.borderColor.set">
  | EditorCommandOf<"class.style.textColor.set">
  | EditorCommandOf<"class.style.borderWidth.set">
  | EditorCommandOf<"class.style.borderDashPattern.set">;

/**
 * Handles class style property source edits.
 */
export function handleStyleCommand(
  command: ClassStyleCommand,
  context: CommandContext
): CommandResult {
  switch (command.type) {
    case "class.style.fillColor.set":
      return planClassStyleMutation(
        { classIds: [command.classId], property: "fill", value: command.fillColor },
        context
      );
    case "class.style.borderColor.set":
      return planClassStyleMutation(
        { classIds: [command.classId], property: "stroke", value: command.borderColor },
        context
      );
    case "class.style.textColor.set":
      return planClassStyleMutation(
        { classIds: [command.classId], property: "color", value: command.textColor },
        context
      );
    case "class.style.borderWidth.set":
    case "class.style.borderDashPattern.set":
      return { ok: false, problem: `Command ${command.type} is not yet implemented` };
  }
}
