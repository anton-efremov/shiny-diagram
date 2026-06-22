/**
 * @fileoverview Handles source-backed class deletion commands.
 */

import type { ClassDeleteCommand } from "../../../../view/commands";
import type { ClassId } from "../../../../shared/ids";
import type { SourceLocation } from "../../../model/sourceLocation";
import type { CommandContext, CommandResult } from "../../commandExecution";
import type { SourceEdit } from "../../sourceEdit";

type LineRange = {
  readonly startLine: number;
  readonly endLine: number;
};

/**
 * Deletes a class declaration and all source-backed references owned by that class.
 */
export function handleClassDeleteCommand(
  command: ClassDeleteCommand,
  context: CommandContext
): CommandResult {
  const node = context.model.classes.get(command.classId);
  if (!node) {
    return { ok: false, problem: `Class ${command.classId} not found` };
  }

  const ranges: LineRange[] = [];

  if (node.location) {
    const declarationRange = findClassDeclarationRange(node.location, context.sourceText);
    if (!declarationRange) {
      return { ok: false, problem: `No safe deletion range for class ${command.classId}` };
    }
    ranges.push(declarationRange);
  }

  ranges.push(
    ...findSpatialAnnotationRanges(command.classId, context.sourceText),
    ...context.model.appliesStyleEdges
      .filter((edge) => edge.source === command.classId)
      .map((edge) => toLineRange(edge.location)),
    ...context.model.relationships
      .filter(
        (relationship) =>
          relationship.source === command.classId || relationship.target === command.classId
      )
      .map((relationship) => toLineRange(relationship.location))
  );

  const edits = mergeLineRanges(ranges).map((range) => toDeleteEdit(range, context.sourceText));

  if (edits.length === 0) {
    return { ok: false, problem: `No deletion ranges for class ${command.classId}` };
  }

  return { ok: true, edits };
}

function findClassDeclarationRange(location: SourceLocation, sourceText: string): LineRange | null {
  const lines = sourceText.split("\n");
  const firstLine = lines[location.startLine] ?? "";

  if (!firstLine.includes("{")) {
    return toLineRange(location);
  }

  let depth = 0;

  for (let line = location.startLine; line < lines.length; line++) {
    depth += countOccurrences(lines[line], "{");
    depth -= countOccurrences(lines[line], "}");

    if (depth <= 0) {
      return { startLine: location.startLine, endLine: line };
    }
  }

  return null;
}

function findSpatialAnnotationRanges(classId: ClassId, sourceText: string): LineRange[] {
  const escapedClassId = escapeRegExp(classId);
  const pattern = new RegExp(`^\\s*%%\\s+@spatial:${escapedClassId}(?:\\s|$)`);

  return sourceText
    .split("\n")
    .flatMap((line, index) => (pattern.test(line) ? [{ startLine: index, endLine: index }] : []));
}

function toLineRange(location: SourceLocation): LineRange {
  return {
    startLine: location.startLine,
    endLine: location.endLine,
  };
}

function mergeLineRanges(ranges: readonly LineRange[]): LineRange[] {
  const sorted = [...ranges]
    .filter((range) => range.startLine <= range.endLine)
    .sort((a, b) => a.startLine - b.startLine || a.endLine - b.endLine);

  const merged: LineRange[] = [];

  for (const range of sorted) {
    const previous = merged[merged.length - 1];
    if (!previous || range.startLine > previous.endLine + 1) {
      merged.push(range);
      continue;
    }

    merged[merged.length - 1] = {
      startLine: previous.startLine,
      endLine: Math.max(previous.endLine, range.endLine),
    };
  }

  return merged;
}

function toDeleteEdit(range: LineRange, sourceText: string): SourceEdit {
  const lines = sourceText.split("\n");
  const hasFollowingLine = range.endLine < lines.length - 1;
  const endLine = hasFollowingLine ? range.endLine + 1 : range.endLine;
  const endCharacter = hasFollowingLine ? 0 : getDocumentLineLength(lines[range.endLine] ?? "");

  return {
    start: { line: range.startLine, character: 0 },
    end: { line: endLine, character: endCharacter },
    replacementText: "",
  };
}

function getDocumentLineLength(line: string): number {
  return line.endsWith("\r") ? line.length - 1 : line.length;
}

function countOccurrences(value: string, character: "{" | "}"): number {
  let count = 0;
  for (const current of value) {
    if (current === character) count++;
  }
  return count;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
