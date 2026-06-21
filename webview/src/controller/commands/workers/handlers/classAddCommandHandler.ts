/**
 * @fileoverview Handles source edits for class placement commands.
 */

import type { ClassAddCommand } from "../../../../view/commands";
import type { SpatialData } from "../../../model/diagramTree";
import type { CommandContext, CommandResult } from "../../commandExecution";
import type { SourceEdit } from "../../sourceEdit";
import { generateClassId } from "../classIdGeneration";
import { formatClassDeclaration, formatSpatialAnnotation } from "../sourceFormatting";

/**
 * Inserts a new class declaration and matching spatial annotation.
 */
export function handleClassAddCommand(
  command: ClassAddCommand,
  context: CommandContext
): CommandResult {
  const classId = generateClassId(context.model);
  const { rect } = command;
  const classLine = formatClassDeclaration(classId);
  const spatialLine = formatSpatialAnnotation(classId, rect.x, rect.y, rect.w, rect.h);
  const eol = getLineEnding(context.sourceText);
  const existingSpatial = getExistingSpatialAnnotations(context);

  if (existingSpatial.length === 0) {
    return {
      ok: true,
      edits: [
        appendAfterDiagramContent(context.sourceText, `${classLine}${eol}${spatialLine}`, eol),
      ],
    };
  }

  const firstSpatial = existingSpatial[0];
  const lastSpatial = existingSpatial[existingSpatial.length - 1];

  return {
    ok: true,
    edits: [
      {
        start: {
          line: lastSpatial.location.endLine,
          character: lastSpatial.location.endChar,
        },
        end: {
          line: lastSpatial.location.endLine,
          character: lastSpatial.location.endChar,
        },
        replacementText: `${eol}${spatialLine}`,
      },
      {
        start: { line: firstSpatial.location.startLine, character: 0 },
        end: { line: firstSpatial.location.startLine, character: 0 },
        replacementText: `${classLine}${eol}`,
      },
    ],
  };
}

function getExistingSpatialAnnotations(context: CommandContext): SpatialData[] {
  return [...context.model.classes.values()]
    .flatMap((node) => (node.spatial ? [node.spatial] : []))
    .sort((a, b) => a.location.startLine - b.location.startLine);
}

function appendAfterDiagramContent(sourceText: string, text: string, eol: string): SourceEdit {
  const sourceLines = sourceText.split(/\r?\n/);
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

function getLineEnding(sourceText: string): string {
  return sourceText.includes("\r\n") ? "\r\n" : "\n";
}
