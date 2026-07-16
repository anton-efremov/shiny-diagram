/**
 * @behavior Named style assignment transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";
import type { ClassView } from "../../../../../views/schema";
import type { StyleDefId } from "../../../../../../shared/ids";

export function toNamedStyleSelectTransaction(
  selectedClasses: readonly ClassView[],
  styleDefId: StyleDefId | null
): EditorCommandTransaction {
  return selectedClasses.flatMap((classView) => [
    { type: "class.appliedStyle.set" as const, classId: classView.classId, styleDefId },
    { type: "class.directStyle.clear" as const, classId: classView.classId },
  ]);
}
