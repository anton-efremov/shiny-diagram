/**
 * @fileoverview Converts parser tokens into Controller source ranges.
 */

import type { SourceSpan } from "../../model/sourceEdit";
import type { ParseToken } from "./tokenizer";

/**
 * Converts a parser token into its exact source location.
 */
export function toSourceSpan(token: ParseToken): SourceSpan {
  return {
    start: { line: token.lineNumber, character: 0 },
    end: {
      line: token.endLine,
      character:
        token.endLine === token.lineNumber ? token.raw.length : getLastLine(token.fullRaw).length,
    },
  };
}

export function toHeaderLocation(token: ParseToken): SourceSpan {
  return {
    start: { line: token.lineNumber, character: 0 },
    end: { line: token.lineNumber, character: token.raw.length },
  };
}

export function toLineFieldLocation(
  token: ParseToken,
  startColumn: number,
  endColumn: number
): SourceSpan {
  return {
    start: { line: token.lineNumber, character: startColumn },
    end: { line: token.lineNumber, character: endColumn },
  };
}

function getLastLine(value: string): string {
  return value.split("\n").at(-1) ?? "";
}
