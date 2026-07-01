/**
 * @fileoverview Handles source-backed class duplication commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { ClassId } from "../../../../shared/ids";
import type { SourceLocation } from "../../../model/sourceLocation";
import type { CommandContext, CommandResult } from "../../commandExecution";
import type { SourceEdit } from "../../sourceEdit";
import { generateDuplicateClassId } from "../classIdGeneration";
import {
  formatClassDeclaration,
  formatClassStyleApplication,
  formatDuplicatedClassDeclaration,
  formatSpatialAnnotation,
} from "../sourceFormatting";

type LineRange = {
  readonly startLine: number;
  readonly endLine: number;
};

type DuplicatePlan = {
  readonly edits: readonly SourceEdit[];
};

/**
 * Duplicates a class declaration, spatial annotation, and first style application.
 */
export function handleClassDuplicateCommand(
  command: EditorCommandOf<"class.duplicate">,
  context: CommandContext
): CommandResult {
  return handleClassDuplicateCommands([command], context);
}

export function handleClassDuplicateCommands(
  commands: readonly EditorCommandOf<"class.duplicate">[],
  context: CommandContext
): CommandResult {
  if (commands.length === 0) {
    return { ok: true, edits: [] };
  }

  const eol = getLineEnding(context.sourceText);
  const reservedClassIds = new Set<ClassId>();
  const sourceClassIds = new Set<ClassId>();
  const plans: DuplicatePlan[] = [];

  for (const command of commands) {
    const sourceClassId = command.sourceClassId;
    if (sourceClassIds.has(sourceClassId)) {
      return { ok: false, problem: `Duplicate source class ${sourceClassId}` };
    }
    sourceClassIds.add(sourceClassId);

    const sourceClass = context.graph.classes.get(sourceClassId);
    if (!sourceClass) {
      return { ok: false, problem: `Class ${sourceClassId} cannot be duplicated` };
    }

    const classId = generateDuplicateClassId(context.graph, sourceClassId, reservedClassIds);
    reservedClassIds.add(classId);

    const styleLine = formatDuplicateStyleLine(sourceClassId, classId, context);
    const spatialLine = formatDuplicateSpatialLine(classId, command);
    const sourceClassLocation = context.provenance.classes.get(sourceClassId);
    const edits = sourceClassLocation
      ? buildExplicitDeclarationEdit(
          sourceClassLocation,
          classId,
          styleLine,
          spatialLine,
          context,
          eol
        )
      : buildImplicitDeclarationEdit(classId, styleLine, spatialLine, context, eol);

    if (!edits) {
      return { ok: false, problem: `No safe duplicate range for class ${sourceClassId}` };
    }

    plans.push({ edits });
  }

  return {
    ok: true,
    edits: coalesceInsertions(plans.flatMap((plan) => plan.edits)),
  };
}

function buildExplicitDeclarationEdit(
  location: SourceLocation,
  classId: ClassId,
  styleLine: string | null,
  spatialLine: string,
  context: CommandContext,
  eol: string
): SourceEdit[] | null {
  const range = findClassDeclarationRange(location, context.sourceText);
  if (!range) return null;

  const declarationText = getRangeText(range, context.sourceText, eol);
  const duplicatedDeclaration = formatDuplicatedClassDeclaration(declarationText, classId);
  if (!duplicatedDeclaration) return null;

  const insertedLines = [duplicatedDeclaration, styleLine, spatialLine].filter(
    (line): line is string => line !== null
  );
  const line = range.endLine;
  const character = getLineLength(line, context.sourceText);

  return [
    {
      start: { line, character },
      end: { line, character },
      replacementText: `${eol}${insertedLines.join(eol)}`,
    },
  ];
}

function buildImplicitDeclarationEdit(
  classId: ClassId,
  styleLine: string | null,
  spatialLine: string,
  context: CommandContext,
  eol: string
): SourceEdit[] {
  const declarationLines = [formatClassDeclaration(classId), styleLine].filter(
    (line): line is string => line !== null
  );
  const existingSpatial = getExistingSpatialAnnotations(context);

  if (existingSpatial.length === 0) {
    return [
      appendAfterDiagramContent(
        context.sourceText,
        [...declarationLines, spatialLine].join(eol),
        eol
      ),
    ];
  }

  const firstSpatial = existingSpatial[0];
  const lastSpatial = existingSpatial[existingSpatial.length - 1];

  return [
    {
      start: { line: lastSpatial.location.endLine, character: lastSpatial.location.endChar },
      end: { line: lastSpatial.location.endLine, character: lastSpatial.location.endChar },
      replacementText: `${eol}${spatialLine}`,
    },
    {
      start: { line: firstSpatial.location.startLine, character: 0 },
      end: { line: firstSpatial.location.startLine, character: 0 },
      replacementText: `${declarationLines.join(eol)}${eol}`,
    },
  ];
}

function coalesceInsertions(edits: readonly SourceEdit[]): SourceEdit[] {
  const coalesced = new Map<string, SourceEdit>();

  for (const edit of edits) {
    const key = `${edit.start.line}:${edit.start.character}:${edit.end.line}:${edit.end.character}`;
    const existing = coalesced.get(key);
    if (!existing) {
      coalesced.set(key, edit);
      continue;
    }

    coalesced.set(key, {
      ...existing,
      replacementText: `${existing.replacementText}${edit.replacementText}`,
    });
  }

  return [...coalesced.values()].sort(
    (a, b) => a.start.line - b.start.line || a.start.character - b.start.character
  );
}

function formatDuplicateStyleLine(
  sourceClassId: ClassId,
  duplicateClassId: ClassId,
  context: CommandContext
): string | null {
  const edge = [...context.graph.styleApplications.values()].find(
    (candidate) => candidate.targetId === sourceClassId
  );
  return edge ? formatClassStyleApplication(duplicateClassId, edge.styleDefId) : null;
}

function formatDuplicateSpatialLine(
  classId: ClassId,
  command: EditorCommandOf<"class.duplicate">
): string {
  return formatSpatialAnnotation(
    classId,
    command.position.x,
    command.position.y,
    command.size.width,
    command.size.height
  );
}

function findClassDeclarationRange(location: SourceLocation, sourceText: string): LineRange | null {
  const lines = getSourceLines(sourceText);
  const firstLine = lines[location.startLine] ?? "";

  if (!firstLine.includes("{")) {
    return { startLine: location.startLine, endLine: location.endLine };
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

function getRangeText(range: LineRange, sourceText: string, eol: string): string {
  return getSourceLines(sourceText)
    .slice(range.startLine, range.endLine + 1)
    .join(eol);
}

function getExistingSpatialAnnotations(context: CommandContext): SpatialData[] {
  return [...context.provenance.classSpatial.entries()]
    .flatMap(([classId, location]) => {
      const spatial = context.graph.classes.get(classId)?.spatial;
      return spatial ? [{ spatial, location }] : [];
    })
    .sort((a, b) => a.location.startLine - b.location.startLine);
}

type SpatialData = {
  readonly spatial: {
    readonly position: { readonly x: number; readonly y: number };
    readonly size: { readonly width: number; readonly height: number };
  };
  readonly location: SourceLocation;
};

function appendAfterDiagramContent(sourceText: string, text: string, eol: string): SourceEdit {
  const sourceLines = getSourceLines(sourceText);
  let anchorLine = sourceLines.length - 1;

  while (anchorLine > 0 && sourceLines[anchorLine].trim() === "") {
    anchorLine--;
  }

  const anchorCharacter = sourceLines[anchorLine]?.length ?? 0;

  return {
    start: { line: anchorLine, character: anchorCharacter },
    end: { line: anchorLine, character: anchorCharacter },
    replacementText: `${eol}${text}`,
  };
}

function getLineLength(lineNumber: number, sourceText: string): number {
  return getSourceLines(sourceText)[lineNumber]?.length ?? 0;
}

function getSourceLines(sourceText: string): string[] {
  return sourceText.split(/\r?\n/);
}

function getLineEnding(sourceText: string): string {
  return sourceText.includes("\r\n") ? "\r\n" : "\n";
}

function countOccurrences(value: string, character: "{" | "}"): number {
  let count = 0;
  for (const current of value) {
    if (current === character) count++;
  }
  return count;
}
