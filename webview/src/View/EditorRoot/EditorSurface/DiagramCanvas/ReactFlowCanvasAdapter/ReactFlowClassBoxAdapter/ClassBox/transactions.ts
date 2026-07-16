/**
 * @behavior Class header commit transaction derivation.
 */

import type { ClassId } from "../../../../../../../shared/ids";
import type { ClassAnnotation } from "../../../../../../../shared/uml";
import type { EditorCommandTransaction } from "../../../../../../commands/editorCommands";

export function toClassHeaderCommitTransaction(
  classId: ClassId,
  block: "annotation" | "name" | "label",
  value: string | null
): EditorCommandTransaction {
  switch (block) {
    case "annotation":
      return [
        { type: "class.annotation.set", classId, annotation: value as ClassAnnotation | null },
      ];
    case "name":
      return [{ type: "class.name.set", classId, name: value ?? "" }];
    case "label":
      return [{ type: "class.label.set", classId, label: value }];
  }
}
