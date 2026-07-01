/**
 * @fileoverview Handles source edits for View class style commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";
import { planClassStyleMutation } from "../styleMutationPlanning";

type ClassStyleCommand =
  | EditorCommandOf<"class.directStyle.property.set">
  | EditorCommandOf<"class.directStyle.clear">;

/**
 * Handles class style property source edits.
 */
export function handleStyleCommand(
  command: ClassStyleCommand,
  context: CommandContext
): CommandResult {
  switch (command.type) {
    case "class.directStyle.property.set":
      if (command.value === null || command.property === "fontSize") {
        // TODO(writeback-step): no old direct-style clear/font-size handler exists yet.
        return { ok: true, edits: [] };
      }
      return planClassStyleMutation(
        { classIds: [command.classId], property: command.property, value: command.value },
        context
      );
    case "class.directStyle.clear":
      // TODO(writeback-step): no old direct-style clear handler exists yet.
      return { ok: true, edits: [] };
  }
}
