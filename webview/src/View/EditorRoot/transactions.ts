/**
 * @behavior Missing annotations generation transaction derivation.
 */

import type { EditorCommandTransaction } from "../commands/editorCommands";
import { calculateClassBoxLayouts } from "../utils/layoutAlgorithm/classBoxLayout";
import type { ClassId } from "../../shared/ids";
import type { ClassView } from "../views/schema";

// Implementing interaction through command transaction
export function toMissingAnnotationsGenerateTransaction(
  missingClassIds: readonly ClassId[],
  classes: readonly ClassView[]
): EditorCommandTransaction {
  return calculateClassBoxLayouts(missingClassIds, classes).map(({ classId, bounds }) => ({
    type: "class.spatial.set",
    classId,
    spatial: {
      position: { x: bounds.x, y: bounds.y },
      size: { width: bounds.w, height: bounds.h },
    },
  }));
}
