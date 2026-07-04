/**
 * @fileoverview
 * Worker: `copyStatement`. Copies a statement's source span verbatim, applies
 * value-level overrides inside that copied text, and inserts the result after
 * an anchor.
 */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";
import { resolveStatementAnchor } from "./helpers/resolveAnchors";
import { resolveStatementRef, resolveValueRef } from "./helpers/resolveRefs";
import { getLineIndent, positionToOffset, sliceSpan } from "./helpers/textUtils";

type CopyStatementIntent = Extract<WriteIntent, { readonly kind: "copyStatement" }>;

export function resolveCopyStatement(
  intent: CopyStatementIntent,
  provenance: ProvenanceIndex,
  sourceText: string,
  eol: string
): SourceEdit {
  const blockSpan = resolveStatementRef(intent.source, provenance);
  const blockStartOffset = positionToOffset(sourceText, blockSpan.start);
  const overriddenText = intent.overrides
    .map((override) => {
      const span = resolveValueRef(override.value, provenance);
      return {
        startOffset: positionToOffset(sourceText, span.start) - blockStartOffset,
        endOffset: positionToOffset(sourceText, span.end) - blockStartOffset,
        replacement: override.replacement,
      };
    })
    .sort((left, right) => right.startOffset - left.startOffset)
    .reduce(
      (text, override) =>
        `${text.slice(0, override.startOffset)}${override.replacement}${text.slice(override.endOffset)}`,
      sliceSpan(sourceText, blockSpan)
    );
  const copyText = removeCopiedFirstLineIndent(
    overriddenText,
    getLineIndent(sourceText, blockSpan.start.line)
  );

  const { position, indent, blankBefore } = resolveStatementAnchor(
    intent.anchor,
    provenance,
    sourceText
  );

  return {
    start: position,
    end: position,
    replacementText: `${blankBefore ? eol : ""}${eol}${indent}${copyText}`,
  };
}

function removeCopiedFirstLineIndent(text: string, sourceIndent: string): string {
  if (sourceIndent === "" || !text.startsWith(sourceIndent)) return text;
  return text.slice(sourceIndent.length);
}
