/**
 * @fileoverview Converts parser tokens into Controller source ranges.
 */

import type { SourceLocation } from "../../model/sourceLocation";
import type { ParseToken } from "./tokenizer";

/**
 * Converts a parser token into its exact source location.
 */
export function toSourceLocation(token: ParseToken): SourceLocation {
  return {
    startLine: token.lineNumber,
    startChar: 0,
    endLine: token.endLine,
    endChar:
      token.endLine === token.lineNumber ? token.raw.length : getLastLine(token.fullRaw).length,
    raw: token.fullRaw,
  };
}

export function toHeaderLocation(token: ParseToken): SourceLocation {
  return {
    startLine: token.lineNumber,
    startChar: 0,
    endLine: token.lineNumber,
    endChar: token.raw.length,
    raw: token.raw,
  };
}

export function toLineFieldLocation(
  token: ParseToken,
  startChar: number,
  endChar: number
): SourceLocation {
  return {
    startLine: token.lineNumber,
    startChar,
    endLine: token.lineNumber,
    endChar,
    raw: token.raw.slice(startChar, endChar),
  };
}

function getLastLine(value: string): string {
  return value.split("\n").at(-1) ?? "";
}
