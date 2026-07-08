/**
 * @fileoverview Worker: `deleteRange`. Removes an already-computed source range.
 */

import type { SourceEdit } from "../../model/sourceEdit";
import type { WriteIntent } from "../../translate";

type DeleteRangeIntent = Extract<WriteIntent, { readonly kind: "deleteRange" }>;

export function resolveDeleteRange(intent: DeleteRangeIntent): SourceEdit {
  return {
    start: intent.target.start,
    end: intent.target.end,
    replacementText: "",
  };
}
