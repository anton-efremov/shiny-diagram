/**
 * @fileoverview Handles source edits for View class style commands.
 */

import type { StyleCommand } from "../../../../shinyView/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";
import { planClassStyleMutation } from "../styleMutationPlanning";

/**
 * Handles class style property source edits.
 */
export function handleStyleCommand(command: StyleCommand, context: CommandContext): CommandResult {
  return planClassStyleMutation(command, context);
}
