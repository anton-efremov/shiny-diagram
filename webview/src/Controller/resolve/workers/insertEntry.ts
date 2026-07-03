/**
 * @fileoverview
 * Worker: `insertEntry`. Writes the payload into a style list at its anchor,
 * prefixed with the anchor's separator (a comma when appending after an entry).
 */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";
import { resolveEntryAnchor } from "../anchors";

type Intent = Extract<WriteIntent, { readonly kind: "insertEntry" }>;

export function resolveInsertEntry(intent: Intent, provenance: ProvenanceIndex): SourceEdit {
  const { position, separator } = resolveEntryAnchor(intent.anchor, provenance);
  return { start: position, end: position, replacementText: `${separator}${intent.payload}` };
}
