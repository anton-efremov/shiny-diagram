/**
 * @fileoverview
 * Worker: `replaceValue`. Overwrites the target value span with the payload.
 */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";
import { resolveValueRef } from "./helpers/resolveRefs";

type ReplaceValueIntent = Extract<WriteIntent, { readonly kind: "replaceValue" }>;

export function resolveReplaceValue(
  intent: ReplaceValueIntent,
  provenance: ProvenanceIndex
): SourceEdit {
  const location = resolveValueRef(intent.target, provenance);
  return {
    start: location.start,
    end: location.end,
    replacementText: intent.payload,
  };
}
