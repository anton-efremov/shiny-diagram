/**
 * @fileoverview
 * Worker: `deleteEntry`. Removes the target property's span, absorbing an
 * adjacent comma (trailing first, else leading) so the surviving list stays
 * well-formed.
 */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";
import { resolveEntryRef } from "./helpers/resolveRefs";
import { getLine } from "./helpers/textUtils";

type DeleteEntryIntent = Extract<WriteIntent, { readonly kind: "deleteEntry" }>;

export function resolveDeleteEntry(
  intent: DeleteEntryIntent,
  provenance: ProvenanceIndex,
  sourceText: string
): SourceEdit {
  const location = resolveEntryRef(intent.target, provenance);
  const line = getLine(sourceText, location.start.line);
  let start = location.start.character;
  let end = location.end.character;

  if (line[end] === ",") {
    end++;
  } else {
    let cursor = start - 1;
    while (cursor >= 0 && /\s/.test(line[cursor])) cursor--;
    if (line[cursor] === ",") start = cursor;
  }

  return {
    start: { line: location.start.line, character: start },
    end: { line: location.end.line, character: end },
    replacementText: "",
  };
}
