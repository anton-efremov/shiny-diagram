/**
 * @fileoverview
 * Resolve pipeline: turn logical write intents into concrete source edits.
 *
 * Stages:
 * - materialize — each intent is dispatched to the worker for its kind, which
 *   produces one `SourceEdit`;
 * - coalesce — insertions at the same position are concatenated in intent order,
 *   so co-located writes compose instead of colliding;
 * - assert — the resulting edits are proven pairwise non-overlapping before they
 *   leave the component.
 *
 * This module owns the pipeline shape; slice resolution, insertion-point
 * resolution, and text mechanics live in `refs`, `anchors`, and `text`.
 */

import type { ProvenanceIndex } from "../model/provenanceIndex";
import type { SourceEdit } from "../model/sourceEdit";
import type { WriteIntent } from "../translate";
import { resolveDeleteEntry } from "./workers/deleteEntry";
import { resolveDeleteRange } from "./workers/deleteRange";
import { resolveDeleteStatement } from "./workers/deleteStatement";
import { resolveInsertEntry } from "./workers/insertEntry";
import { resolveInsertStatement } from "./workers/insertStatement";
import { resolveReplaceValue } from "./workers/replaceValue";
import type { SourcePosition } from "../model/sourceEdit";

export function resolveIntents(
  intents: readonly WriteIntent[],
  provenance: ProvenanceIndex,
  sourceText: string
): SourceEdit[] {
  const eol = sourceText.includes("\r\n") ? "\r\n" : "\n"; // detects which EOL used in source
  const edits = intents.map((intent) => buildEdit(intent, provenance, sourceText, eol));
  return assertNoOverlaps(coalesceInsertions(edits));
}

function buildEdit(
  intent: WriteIntent,
  provenance: ProvenanceIndex,
  sourceText: string,
  eol: string
): SourceEdit {
  switch (intent.kind) {
    case "insertStatement":
      return resolveInsertStatement(intent, provenance, sourceText, eol);
    case "deleteStatement":
      return resolveDeleteStatement(intent, provenance, sourceText);
    case "insertEntry":
      return resolveInsertEntry(intent, provenance);
    case "deleteEntry":
      return resolveDeleteEntry(intent, provenance, sourceText);
    case "replaceValue":
      return resolveReplaceValue(intent, provenance);
    case "deleteRange":
      return resolveDeleteRange(intent);
  }
}

// ============================================================================
// Edit-list post-processing
// ============================================================================

/**
 * Concatenates insertions sharing an exact position (in order); leaves other edits distinct.
 * Needed so edits to the same source locations do not get dumped by VSCode's
 * vscode.workspace.applyEdit(workspaceEdit)
 */
function coalesceInsertions(edits: readonly SourceEdit[]): SourceEdit[] {
  const grouped = new Map<string, SourceEdit>();

  for (const edit of edits) {
    const key = `${edit.start.line}:${edit.start.character}:${edit.end.line}:${edit.end.character}`;
    const existing = grouped.get(key);
    if (existing && isInsertion(existing) && isInsertion(edit)) {
      grouped.set(key, {
        ...existing,
        replacementText: `${existing.replacementText}${edit.replacementText}`,
      });
    } else if (!existing) {
      grouped.set(key, edit);
    } else {
      grouped.set(`${key}:${grouped.size}`, edit);
    }
  }

  return [...grouped.values()].sort(compareEdits);
}

/** Proves the edits are pairwise non-overlapping; throws otherwise. */
function assertNoOverlaps(edits: readonly SourceEdit[]): SourceEdit[] {
  const sorted = [...edits].sort(compareEdits);
  for (let index = 1; index < sorted.length; index++) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (positionsOverlap(previous.end, current.start)) {
      throw new Error("Overlapping source edits");
    }
  }
  return sorted;
}

function compareEdits(left: SourceEdit, right: SourceEdit): number {
  return left.start.line - right.start.line || left.start.character - right.start.character;
}

function isInsertion(edit: SourceEdit): boolean {
  return edit.start.line === edit.end.line && edit.start.character === edit.end.character;
}

/** Whether one edit's end sits strictly past the next edit's start (touching is allowed). */
export function positionsOverlap(leftEnd: SourcePosition, rightStart: SourcePosition): boolean {
  if (leftEnd.line < rightStart.line) return false;
  if (leftEnd.line === rightStart.line && leftEnd.character <= rightStart.character) return false;
  return true;
}
