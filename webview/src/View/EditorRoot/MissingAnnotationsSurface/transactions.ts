/**
 * @behavior Missing annotations generation transaction derivation.
 */

import type { EditorCommandTransaction } from "../../commands/editorCommands";
import { calculateClassBoxLayouts } from "../../utils/layoutAlgorithm/classBoxLayout";
import type { ClassId } from "../../../shared/ids";
import type { ClassView } from "../../views/schema";

// Implementing interaction through command transaction
export function toMissingAnnotationsGenerateTransaction(
  missingClassIds: readonly ClassId[],
  classes: readonly ClassView[]
): EditorCommandTransaction {
  return calculateClassBoxLayouts(missingClassIds, classes).flatMap(({ classId, bounds }) => [
    {
      type: "class.position.set",
      classId,
      position: { x: bounds.x, y: bounds.y },
    },
    {
      type: "class.size.set",
      classId,
      size: { width: bounds.w, height: bounds.h },
    },
  ]);
}
