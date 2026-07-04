/**
 * @fileoverview
 * Text & position mechanics.
 *
 * Pure string and coordinate math: reading raw source lines, deriving
 * indentation, detecting the document's line terminator, and converting or
 * comparing source positions. Knows nothing of provenance, intents, or edit
 * semantics — it is the lowest layer the resolve component shares.
 */

import type { SourcePosition, SourceSpan } from "../../../model/sourceEdit";

/** The raw text of a line without its terminator, or "" when out of range. */
export function getLine(sourceText: string, lineNumber: number): string {
  return sourceText.split(/\r?\n/)[lineNumber] ?? "";
}

/** The leading-whitespace prefix of a line. */
export function getLineIndent(sourceText: string, lineNumber: number): string {
  return /^\s*/.exec(getLine(sourceText, lineNumber))?.[0] ?? "";
}

/** The exact source text covered by a span. */
export function sliceSpan(sourceText: string, span: SourceSpan): string {
  return sourceText.slice(
    positionToOffset(sourceText, span.start),
    positionToOffset(sourceText, span.end)
  );
}

/** Converts a line/character source coordinate to a string offset. */
export function positionToOffset(sourceText: string, position: SourcePosition): number {
  let offset = 0;
  let line = 0;

  while (line < position.line && offset < sourceText.length) {
    const nextLf = sourceText.indexOf("\n", offset);
    if (nextLf === -1) return sourceText.length;
    offset = nextLf + 1;
    line++;
  }

  return offset + position.character;
}
