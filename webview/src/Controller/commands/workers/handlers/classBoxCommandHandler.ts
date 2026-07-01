/**
 * @fileoverview Handles View class position and size commands.
 */

import type { Point, Size } from "../../../../shared/geometry";
import type { ClassId } from "../../../../shared/ids";
import type { SourceLocation } from "../../../model/sourceLocation";
import type { CommandContext, CommandResult } from "../../commandExecution";
import type { SourceEdit } from "../../sourceEdit";
import { formatSpatialAnnotation } from "../sourceFormatting";

export type ClassSpatialMutation = {
  readonly classId: ClassId;
  readonly position?: Point;
  readonly size?: Size;
};

/**
 * Persists one class spatial annotation using command facts plus existing source facts.
 */
export function handleClassSpatialMutation(
  mutation: ClassSpatialMutation,
  context: CommandContext
): CommandResult {
  const node = context.graph.classes.get(mutation.classId);
  if (!node) {
    return { ok: false, problem: `Class ${mutation.classId} not found` };
  }

  const existing = node.spatial;
  const position = mutation.position ?? existing?.position ?? null;
  const size = mutation.size ?? existing?.size ?? null;

  if (!position || !size) {
    return {
      ok: false,
      problem: `Incomplete spatial data for class ${mutation.classId}`,
    };
  }

  const replacementText = formatSpatialAnnotation(
    mutation.classId,
    position.x,
    position.y,
    size.width,
    size.height
  );

  const location = context.provenance.classSpatial.get(mutation.classId);
  if (location) {
    return {
      ok: true,
      edits: [toReplacementEdit(location, replacementText)],
    };
  }

  const malformed = context.malformedAnnotations?.get(mutation.classId);
  if (malformed) {
    return {
      ok: true,
      edits: [toReplacementEdit(malformed, replacementText)],
    };
  }

  return {
    ok: true,
    edits: [toSpatialAnnotationInsertion(context, replacementText)],
  };
}

function toReplacementEdit(location: SourceLocation, replacementText: string): SourceEdit {
  return {
    start: { line: location.startLine, character: location.startChar },
    end: { line: location.endLine, character: location.endChar },
    replacementText,
  };
}

function toSpatialAnnotationInsertion(context: CommandContext, spatialLine: string): SourceEdit {
  const existingSpatialLocations = [...context.provenance.classSpatial.values()];
  const sourceLines = context.sourceText.split(/\r?\n/);
  let anchorLine: number;

  if (existingSpatialLocations.length > 0) {
    anchorLine = Math.max(...existingSpatialLocations.map((location) => location.startLine));
  } else {
    anchorLine = sourceLines.length - 1;
    while (anchorLine > 0 && sourceLines[anchorLine].trim() === "") {
      anchorLine--;
    }
  }

  const anchorCharacter = sourceLines[anchorLine]?.length ?? 0;

  return {
    start: { line: anchorLine, character: anchorCharacter },
    end: { line: anchorLine, character: anchorCharacter },
    replacementText: `${getLineEnding(context.sourceText)}${spatialLine}`,
  };
}

function getLineEnding(sourceText: string): string {
  return sourceText.includes("\r\n") ? "\r\n" : "\n";
}
