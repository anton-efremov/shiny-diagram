/**
 * @fileoverview
 * Text & position mechanics.
 *
 * Pure string and coordinate math: reading raw source lines, deriving
 * indentation, detecting the document's line terminator, and converting or
 * comparing source positions. Knows nothing of provenance, intents, or edit
 * semantics — it is the lowest layer the resolve component shares.
 */

import type { SourceLocation } from "../model/provenanceIndex";
import type { SourcePosition } from "../model/sourceEdit";

/** The document's dominant line terminator, so emitted edits match it. */
export function detectEol(sourceText: string): string {
  return sourceText.includes("\r\n") ? "\r\n" : "\n";
}

/** The raw text of a line without its terminator, or "" when out of range. */
export function getLine(sourceText: string, lineNumber: number): string {
  return sourceText.split(/\r?\n/)[lineNumber] ?? "";
}

/** The leading-whitespace prefix of a line. */
export function getLineIndent(sourceText: string, lineNumber: number): string {
  return /^\s*/.exec(getLine(sourceText, lineNumber))?.[0] ?? "";
}

/** The opening corner of a slice, as an edit position. */
export function toStartPosition(location: SourceLocation): SourcePosition {
  return { line: location.startLine, character: location.startChar };
}

/** The closing corner of a slice, as an edit position. */
export function toEndPosition(location: SourceLocation): SourcePosition {
  return { line: location.endLine, character: location.endChar };
}

/** Whether one edit's end sits strictly past the next edit's start (touching is allowed). */
export function positionsOverlap(leftEnd: SourcePosition, rightStart: SourcePosition): boolean {
  if (leftEnd.line < rightStart.line) return false;
  if (leftEnd.line === rightStart.line && leftEnd.character <= rightStart.character) return false;
  return true;
}
