/**
 * @fileoverview Parses statement-bound note annotations and attaches them by adjacency.
 */

import type { SpatialAttachment } from "../../../shared/geometry";
import type { NoteId } from "../../../shared/ids";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex, SpatialRecord } from "../../model/provenanceIndex";
import type { SourceSpan } from "../../model/sourceEdit";
import type { EditorDiagnostic } from "../parseResult";
import type { ParseToken } from "./tokenizer";
import { toSourceSpan } from "./toSourceSpan";

type ParsedNoteAnnotation = {
  readonly token: ParseToken;
  readonly spatial: SpatialAttachment | null;
  readonly record: SpatialRecord | null;
};

export type NoteAnnotationJoinResult = {
  readonly graph: DiagramGraph;
  readonly provenance: ProvenanceIndex;
  readonly diagnostics: readonly EditorDiagnostic[];
};

export function attachNoteAnnotations(
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  tokens: readonly ParseToken[]
): NoteAnnotationJoinResult {
  const flatTokens = flattenTokens(tokens);
  const noteByLine = new Map<number, NoteId>();
  for (const [noteId, record] of provenance.notes) {
    noteByLine.set(record.self.start.line, noteId);
  }

  const annotations = flatTokens
    .filter((token) => token.type === "noteAnnotation")
    .map(parseNoteAnnotation);
  const annotationByLine = new Map(annotations.map((entry) => [entry.token.lineNumber, entry]));
  const consumed = new Set<ParseToken>();
  const diagnostics: EditorDiagnostic[] = [];
  const notes = new Map(graph.notes);
  const noteAnnotations = new Map(provenance.noteAnnotations);

  for (const [noteId, noteRecord] of provenance.notes) {
    const adjacent = contiguousAnnotationsAbove(noteRecord.self.start.line, annotationByLine);
    if (adjacent.length === 0) continue;

    const [nearest, ...duplicates] = adjacent;
    consumed.add(nearest.token);
    for (const duplicate of duplicates) {
      consumed.add(duplicate.token);
      diagnostics.push({
        kind: "duplicateAnnotation",
        elementId: noteId,
        message: `Multiple @note annotations above note at line ${
          noteRecord.self.start.line + 1
        }; nearest annotation wins`,
      });
    }

    if (!nearest.spatial || !nearest.record) {
      diagnostics.push({
        kind: "malformedAnnotation",
        elementId: noteId,
        message: `Malformed @note annotation at line ${nearest.token.lineNumber + 1}`,
      });
      continue;
    }

    const note = notes.get(noteId);
    if (!note) continue;
    notes.set(noteId, { ...note, spatial: nearest.spatial });
    noteAnnotations.set(noteId, nearest.record);
  }

  for (const annotation of annotations) {
    if (consumed.has(annotation.token)) continue;
    diagnostics.push({
      kind: "orphanedAnnotation",
      message: `Orphaned @note annotation at line ${annotation.token.lineNumber + 1}`,
    });
  }

  return {
    graph: { ...graph, notes },
    provenance: { ...provenance, noteAnnotations },
    diagnostics,
  };
}

function contiguousAnnotationsAbove(
  noteLine: number,
  annotationByLine: ReadonlyMap<number, ParsedNoteAnnotation>
): ParsedNoteAnnotation[] {
  const annotations: ParsedNoteAnnotation[] = [];
  for (let line = noteLine - 1; ; line--) {
    const annotation = annotationByLine.get(line);
    if (!annotation) break;
    annotations.push(annotation);
  }
  return annotations;
}

function parseNoteAnnotation(token: ParseToken): ParsedNoteAnnotation {
  const values = parseSpatialValues(token.raw);
  if (!values) return { token, spatial: null, record: null };
  const spatial = {
    position: { x: values.x, y: values.y },
    size: { width: values.w, height: values.h },
  };
  return { token, spatial, record: toNoteAnnotationRecord(toSourceSpan(token), token.raw) };
}

function parseSpatialValues(rawLine: string): Record<"x" | "y" | "w" | "h", number> | null {
  const values = {
    x: readNumber(rawLine, "x"),
    y: readNumber(rawLine, "y"),
    w: readNumber(rawLine, "w"),
    h: readNumber(rawLine, "h"),
  };
  return Object.values(values).every((value) => value !== null)
    ? (values as Record<"x" | "y" | "w" | "h", number>)
    : null;
}

function readNumber(rawLine: string, key: "x" | "y" | "w" | "h"): number | null {
  const match = new RegExp(`(?:^|\\s)${key}=([^\\s]+)`).exec(rawLine);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function toNoteAnnotationRecord(location: SourceSpan, rawLine: string): SpatialRecord {
  return {
    self: location,
    fields: {
      target: toNoteMarkerLocation(location, rawLine),
      x: toSpatialValueLocation(location, rawLine, "x"),
      y: toSpatialValueLocation(location, rawLine, "y"),
      w: toSpatialValueLocation(location, rawLine, "w"),
      h: toSpatialValueLocation(location, rawLine, "h"),
    },
  };
}

function toNoteMarkerLocation(location: SourceSpan, rawLine: string): SourceSpan {
  const start = rawLine.indexOf("@note:");
  const position = start === -1 ? 0 : start + "@note:".length;
  return {
    start: { line: location.start.line, character: position },
    end: { line: location.start.line, character: position },
  };
}

function toSpatialValueLocation(
  location: SourceSpan,
  rawLine: string,
  key: "x" | "y" | "w" | "h"
): SourceSpan {
  const match = new RegExp(`(?:^|\\s)${key}=([^\\s]+)`).exec(rawLine);
  if (!match || match.index === undefined) {
    throw new Error(`Missing note coordinate ${key}`);
  }
  const keyStart = rawLine.indexOf(`${key}=`, match.index);
  const start = keyStart + 2;
  return {
    start: { line: location.start.line, character: start },
    end: { line: location.start.line, character: start + match[1].length },
  };
}

function flattenTokens(tokens: readonly ParseToken[]): ParseToken[] {
  return tokens.flatMap((token) => [
    token,
    ...(token.blockTokens ? flattenTokens(token.blockTokens) : []),
  ]);
}
