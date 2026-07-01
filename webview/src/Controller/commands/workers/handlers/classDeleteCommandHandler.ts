/**
 * @fileoverview Handles source-backed class deletion commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
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
  command: EditorCommandOf<"class.delete">,
  context: CommandContext
): CommandResult {
  return handleClassDeleteCommands([command.classId], context);
}

export function handleClassDeleteCommands(
  requestedClassIds: readonly ClassId[],
  context: CommandContext
): CommandResult {
  if (requestedClassIds.length === 0) {
    return { ok: true, edits: [] };
  }

  const classIds = new Set<ClassId>();
  for (const classId of requestedClassIds) {
    if (classIds.has(classId)) {
      return { ok: false, problem: `Duplicate delete for class ${classId}` };
    }
    classIds.add(classId);
  }

  const ranges: LineRange[] = [];

  for (const classId of requestedClassIds) {
    const node = context.graph.classes.get(classId);
    if (!node) {
      return { ok: false, problem: `Class ${classId} not found` };
    }

    const location = context.provenance.classes.get(classId);
    if (location) {
      const declarationRange = findClassDeclarationRange(location, context.sourceText);
      if (!declarationRange) {
        return { ok: false, problem: `No safe deletion range for class ${classId}` };
      }
      ranges.push(declarationRange);
    }
  }

  ranges.push(
    ...findSpatialAnnotationRanges(classIds, context.sourceText),
    ...[...context.graph.styleApplications.values()]
      .filter((edge) => classIds.has(edge.targetId))
      .flatMap((edge) => {
        const location = context.provenance.styleApplications.get(edge.id);
        return location ? [toLineRange(location)] : [];
      }),
    ...[...context.graph.relationships.values()]
      .filter(
        (relationship) =>
          classIds.has(relationship.source.classId) || classIds.has(relationship.target.classId)
      )
      .flatMap((relationship) => {
        const location = context.provenance.relationships.get(relationship.id);
        return location ? [toLineRange(location)] : [];
      })
  );

  const edits = mergeLineRanges(ranges).map((range) => toDeleteEdit(range, context.sourceText));

  if (edits.length === 0) {
    return { ok: false, problem: "No deletion ranges for selected classes" };
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

function findSpatialAnnotationRanges(
  classIds: ReadonlySet<ClassId>,
  sourceText: string
): LineRange[] {
  const patterns = [...classIds].map(
    (classId) => new RegExp(`^\\s*%%\\s+@spatial:${escapeRegExp(classId)}(?:\\s|$)`)
  );

  return sourceText
    .split("\n")
    .flatMap((line, index) =>
      patterns.some((pattern) => pattern.test(line)) ? [{ startLine: index, endLine: index }] : []
    );
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
