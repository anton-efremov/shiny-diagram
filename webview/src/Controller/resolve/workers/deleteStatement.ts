/**
 * @fileoverview
 * Worker: `deleteStatement`. Removes the target's full line(s), consuming the
 * following newline when a line follows, otherwise trimming to the line's end.
 */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";
import { resolveStatementRef } from "./helpers/resolveRefs";
import { getLine } from "./helpers/textUtils";

type DeleteStatementIntent = Extract<WriteIntent, { readonly kind: "deleteStatement" }>;

export function resolveDeleteStatement(
  intent: DeleteStatementIntent,
  provenance: ProvenanceIndex,
  sourceText: string
): SourceEdit {
  const location = resolveStatementRef(intent.target, provenance);
  const lineCount = sourceText.split("\n").length;
  const hasFollowingLine = location.end.line < lineCount - 1;
  return {
    start: { line: location.start.line, character: 0 },
    end: {
      line: hasFollowingLine ? location.end.line + 1 : location.end.line,
      character: hasFollowingLine ? 0 : getLine(sourceText, location.end.line).length,
    },
    replacementText: "",
  };
}
