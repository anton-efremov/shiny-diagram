/**
 * @fileoverview
 * Worker: `insertStatement`. Writes the payload as a new line after its anchor,
 * indented to the anchor's block, with the document EOL leading the new line.
 */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";
import { resolveStatementAnchor } from "./helpers/resolveAnchors";

type InsertStatementIntent = Extract<WriteIntent, { readonly kind: "insertStatement" }>;

export function resolveInsertStatement(
  intent: InsertStatementIntent,
  provenance: ProvenanceIndex,
  sourceText: string,
  eol: string
): SourceEdit {
  const { position, indent, blankBefore } = resolveStatementAnchor(
    intent.anchor,
    provenance,
    sourceText
  );
  const lines = intent.payload.split("\n").map((line) => (line === "" ? line : `${indent}${line}`));
  return {
    start: position,
    end: position,
    replacementText: `${blankBefore ? eol : ""}${eol}${lines.join(eol)}`,
  };
}
