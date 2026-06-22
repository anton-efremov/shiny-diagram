/**
 * @fileoverview Handles View class movement and resizing commands.
 */

import type { ClassBoxCommand, ClassMoveCommand } from "../../../../shinyView/commands";
import type { CommandContext, CommandResult } from "../../commandExecution";
import { formatSpatialAnnotation } from "../sourceFormatting";

/**
 * Handles class box movement and resizing source edits.
 */
export function handleClassBoxCommand(
  command: ClassMoveCommand | ClassBoxCommand,
  context: CommandContext
): CommandResult {
  if (command.type === "class.move") {
    return handleClassMoveCommand(command, context);
  }

  const node = context.model.classes.get(command.classId);
  if (!node?.spatial) {
    return { ok: false, problem: `No spatial data for class ${command.classId}` };
  }

  const { rect } = command;
  const newText = formatSpatialAnnotation(command.classId, rect.x, rect.y, rect.w, rect.h);

  return {
    ok: true,
    edits: [
      {
        start: {
          line: node.spatial.location.startLine,
          character: node.spatial.location.startChar,
        },
        end: {
          line: node.spatial.location.endLine,
          character: node.spatial.location.endChar,
        },
        replacementText: newText,
      },
    ],
  };
}

function handleClassMoveCommand(command: ClassMoveCommand, context: CommandContext): CommandResult {
  if (command.moves.length === 0) {
    return { ok: false, problem: "No classes to move" };
  }

  const seen = new Set<string>();
  for (const move of command.moves) {
    if (seen.has(move.classId)) {
      return { ok: false, problem: `Duplicate move for class ${move.classId}` };
    }
    seen.add(move.classId);
  }

  const replacements = [];
  for (const move of command.moves) {
    const node = context.model.classes.get(move.classId);
    if (!node?.spatial) {
      return { ok: false, problem: `No spatial data for moved class ${move.classId}` };
    }

    replacements.push({
      location: node.spatial.location,
      replacementText: formatSpatialAnnotation(
        move.classId,
        move.rect.x,
        move.rect.y,
        move.rect.w,
        move.rect.h
      ),
    });
  }

  const sorted = replacements.sort(
    (a, b) =>
      a.location.startLine - b.location.startLine || a.location.startChar - b.location.startChar
  );

  for (let index = 1; index < sorted.length; index++) {
    if (rangesOverlap(sorted[index - 1].location, sorted[index].location)) {
      return { ok: false, problem: "Overlapping class move ranges" };
    }
  }

  return {
    ok: true,
    edits: sorted.map(({ location, replacementText }) => ({
      start: { line: location.startLine, character: location.startChar },
      end: { line: location.endLine, character: location.endChar },
      replacementText,
    })),
  };
}

function rangesOverlap(
  left: {
    readonly startLine: number;
    readonly startChar: number;
    readonly endLine: number;
    readonly endChar: number;
  },
  right: {
    readonly startLine: number;
    readonly startChar: number;
    readonly endLine: number;
    readonly endChar: number;
  }
): boolean {
  if (left.endLine < right.startLine) return false;
  if (left.endLine === right.startLine && left.endChar <= right.startChar) return false;
  return true;
}
