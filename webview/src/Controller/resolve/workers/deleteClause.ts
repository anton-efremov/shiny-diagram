/** @fileoverview Worker for deleting a clause and its clause-owned presentation. */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";
import { resolveClauseRef } from "./helpers/resolveRefs";
import { getLine } from "./helpers/textUtils";

type DeleteClauseIntent = Extract<WriteIntent, { readonly kind: "deleteClause" }>;

export function resolveDeleteClause(
  intent: DeleteClauseIntent,
  provenance: ProvenanceIndex,
  sourceText: string
): SourceEdit {
  const span = resolveClauseRef(intent.target, provenance);
  if (intent.target.kind === "classGeneric" || intent.target.kind === "classLabel") {
    return { start: span.start, end: span.end, replacementText: "" };
  }

  const line = getLine(sourceText, span.start.line);
  if (intent.target.kind === "relationshipLabel") {
    let start = span.start.character;
    let cursor = start - 1;
    while (cursor >= 0 && /\s/.test(line[cursor])) cursor--;
    if (line[cursor] !== ":") throw new Error("Missing relationship label attachment operator");
    cursor--;
    while (cursor >= 0 && /\s/.test(line[cursor])) cursor--;
    start = cursor + 1;
    return {
      start: { line: span.start.line, character: start },
      end: span.end,
      replacementText: "",
    };
  }

  const openQuote = span.start.character - 1;
  const closeQuote = span.end.character;
  if (line[openQuote] !== '"' || line[closeQuote] !== '"') {
    throw new Error("Missing relationship multiplicity quotes");
  }
  let start = openQuote;
  let end = closeQuote + 1;
  while (start > 0 && /\s/.test(line[start - 1])) start--;
  while (end < line.length && /\s/.test(line[end])) end++;
  return {
    start: { line: span.start.line, character: start },
    end: { line: span.end.line, character: end },
    replacementText: " ",
  };
}
