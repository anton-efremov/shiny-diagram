/**
 * @fileoverview Stub rule for relationship extraction. Sprint 2 scope.
 */

import type { Relationship } from "../diagramModel";
import type { TokenizedLine } from "../tokenizer";

/**
 * Extracts relationship edges from the tokenized source.
 * Sprint 1 stub — returns an empty array.
 *
 * @param lines - Flat tokenized line sequence from the tokenizer.
 * @returns Empty array; relationships are out of scope for Sprint 1.
 */
export function parseRelationships(lines: TokenizedLine[]): Relationship[] {
  void lines;
  return [];
}
