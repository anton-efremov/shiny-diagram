/**
 * @fileoverview Extracts class declarations from tokenized Mermaid source.
 * Sprint 1 scope: class names and styleDefName only. Members (fields, methods)
 * are out of scope this sprint — all ClassNodes are produced with empty members.
 */

import type { ClassNode } from "../diagramModel";
import type { TokenizedLine } from "../tokenizer";

/**
 * Extracts all declared classes from the tokenized source.
 * Merges styleApplication lines into the matching ClassNode so each node
 * carries the styleDefName resolved from "class Foo:::StyleName" syntax.
 *
 * @param lines - Flat tokenized line sequence from the tokenizer.
 * @returns Array of ClassNode values with empty members arrays.
 */
export function parseClasses(lines: TokenizedLine[]): ClassNode[] {
  const classMap = new Map<string, ClassNode>();

  // First pass: collect explicit class declarations.
  for (const line of lines) {
    if (line.type !== "classDecl") continue;

    const match = /^\s*class\s+(\w+)/.exec(line.raw);
    if (!match) continue;

    const id = match[1];
    // Avoid overwriting if already inserted (shouldn't happen in valid source).
    if (!classMap.has(id)) {
      classMap.set(id, {
        id,
        members: [],
        location: { line: line.lineNumber, raw: line.raw },
      });
    }
  }

  // Second pass: attach styleDefName from "class Foo:::StyleName" lines.
  for (const line of lines) {
    if (line.type !== "styleApplication") continue;

    const match = /^\s*class\s+(\w+):::(\w+)/.exec(line.raw);
    if (!match) continue;

    const id = match[1];
    const styleDefName = match[2];

    const existing = classMap.get(id);
    if (existing) {
      classMap.set(id, { ...existing, styleDefName });
    }
  }

  return [...classMap.values()];
}
