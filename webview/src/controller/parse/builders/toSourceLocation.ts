import type { SourceLocation } from "../../../primitives";
import type { ParseToken } from "../tokenizer";

export function toSourceLocation(token: ParseToken): SourceLocation {
  return {
    startLine: token.lineNumber,
    startChar: 0,
    endLine: token.lineNumber,
    endChar: token.raw.length,
    raw: token.raw,
  };
}
