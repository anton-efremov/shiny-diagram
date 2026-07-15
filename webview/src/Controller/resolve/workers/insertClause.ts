/** @fileoverview Worker for inserting an optional statement clause. */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";
import { resolveValueRef } from "./helpers/resolveRefs";

type InsertClauseIntent = Extract<WriteIntent, { readonly kind: "insertClause" }>;

export function resolveInsertClause(
  intent: InsertClauseIntent,
  provenance: ProvenanceIndex
): SourceEdit {
  const position = resolveValueRef(intent.anchor.component, provenance).end;
  const prefix =
    intent.anchor.clause.kind === "relationshipLabel"
      ? " : "
      : intent.anchor.clause.kind.startsWith("relationship")
        ? " "
        : "";
  return { start: position, end: position, replacementText: `${prefix}${intent.payload}` };
}
