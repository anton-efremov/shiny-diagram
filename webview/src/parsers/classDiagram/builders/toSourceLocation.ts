/**
 * @fileoverview Shared source-location builder for class diagram parse tokens.
 */

import type { SourceLocation } from "../../../models/classDiagram/diagramTreeModel";
import type { ParseToken } from "../tokenizer";

/**
 * Converts a parse token's source span into a diagram tree SourceLocation.
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
