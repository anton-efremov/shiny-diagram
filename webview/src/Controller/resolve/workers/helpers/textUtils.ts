/**
 * @fileoverview
 * Text & position mechanics.
 *
 * Pure string and coordinate math: reading raw source lines, deriving
 * indentation, detecting the document's line terminator, and converting or
 * comparing source positions. Knows nothing of provenance, intents, or edit
 * semantics — it is the lowest layer the resolve component shares.
 */

/** The raw text of a line without its terminator, or "" when out of range. */
export function getLine(sourceText: string, lineNumber: number): string {
  return sourceText.split(/\r?\n/)[lineNumber] ?? "";
}

/** The leading-whitespace prefix of a line. */
export function getLineIndent(sourceText: string, lineNumber: number): string {
  return /^\s*/.exec(getLine(sourceText, lineNumber))?.[0] ?? "";
}
