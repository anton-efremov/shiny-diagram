/**
 * @fileoverview
 * Worker: `deleteStatement`. Removes the target's full line(s), consuming the
 * following newline when a line follows, otherwise trimming to the line's end.
 */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";
import { resolveStatementRef } from "../refs";
import { getLine } from "../text";

type Intent = Extract<WriteIntent, { readonly kind: "deleteStatement" }>;

export function resolveDeleteStatement(
  intent: Intent,
  provenance: ProvenanceIndex,
  sourceText: string
): SourceEdit {
  const location = resolveStatementRef(intent.target, provenance);
  const lineCount = sourceText.split("\n").length;
  const hasFollowingLine = location.endLine < lineCount - 1;
  return {
    start: { line: location.startLine, character: 0 },
    end: {
      line: hasFollowingLine ? location.endLine + 1 : location.endLine,
      character: hasFollowingLine ? 0 : getLine(sourceText, location.endLine).length,
    },
    replacementText: "",
  };
}
