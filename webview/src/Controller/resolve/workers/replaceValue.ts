/**
 * @fileoverview
 * Worker: `replaceValue`. Overwrites the target value span with the payload.
 */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";
import { resolveValueRef } from "../refs";
import { toEndPosition, toStartPosition } from "../text";

type Intent = Extract<WriteIntent, { readonly kind: "replaceValue" }>;

export function resolveReplaceValue(intent: Intent, provenance: ProvenanceIndex): SourceEdit {
  const location = resolveValueRef(intent.target, provenance);
  return {
    start: toStartPosition(location),
    end: toEndPosition(location),
    replacementText: intent.payload,
  };
}
