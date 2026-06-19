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
    endLine: token.lineNumber,
    endChar: token.raw.length,
    raw: token.raw,
  };
}
