/**
 * @fileoverview Stub rule for namespace extraction. Sprint 2 scope.
 */

import type { TokenizedLine } from "../tokenizer";

/**
 * Extracts namespace blocks from the tokenized source.
 * Sprint 1 stub — returns an empty Map.
 *
 * @param lines - Flat tokenized line sequence from the tokenizer.
 * @returns Empty Map; namespaces are out of scope for Sprint 1.
 */
export function parseNamespaces(lines: TokenizedLine[]): Map<string, never> {
  void lines;
  return new Map<string, never>();
}
