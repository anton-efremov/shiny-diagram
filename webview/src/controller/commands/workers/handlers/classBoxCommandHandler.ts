/**
 * @fileoverview Handles View class movement and resizing commands.
 */

import type { ClassBoxCommand, ClassMoveCommand } from "../../../../view/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";
import { formatSpatialAnnotation } from "../sourceFormatting";

/**
 * Handles class box movement and resizing source edits.
 */
export function handleClassBoxCommand(
  command: ClassMoveCommand | ClassBoxCommand,
  context: CommandContext
): CommandResult {
  const node = context.model.classes.get(command.classId);
  if (!node?.spatial) {
    return { ok: false, problem: `No spatial data for class ${command.classId}` };
  }

  const { rect } = command;
  const newText = formatSpatialAnnotation(command.classId, rect.x, rect.y, rect.w, rect.h);

  return {
    ok: true,
    edits: [{ kind: "replaceLine", lineNumber: node.spatial.location.startLine, newText }],
  };
}
