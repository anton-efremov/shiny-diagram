/**
 * @behavior Class header text-block transaction derivation.
 */

import type { ClassId } from "../../../../../shared/ids";
import type { ClassAnnotation } from "../../../../../shared/uml";
import type { EditorCommandTransaction } from "../../../../commands/editorCommands";

export function toClassNameCommitTransaction(
  classId: ClassId,
  name: string
): EditorCommandTransaction {
  return [{ type: "class.name.set", classId, name }];
}

export function toClassAnnotationCommitTransaction(
  classId: ClassId,
  annotation: ClassAnnotation | null
): EditorCommandTransaction {
  return [{ type: "class.annotation.set", classId, annotation }];
}

export function toClassLabelCommitTransaction(
  classId: ClassId,
  label: string | null
): EditorCommandTransaction {
  return [{ type: "class.label.set", classId, label }];
}
