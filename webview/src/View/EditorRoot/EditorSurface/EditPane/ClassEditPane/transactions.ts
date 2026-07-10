/**
 * @behavior Class header text-block and direct-style save transaction derivation.
 */

import type { ClassId } from "../../../../../shared/ids";
import type { StyleProperties } from "../../../../../shared/style";
import type { ClassAnnotation } from "../../../../../shared/uml";
import type { EditorCommandTransaction } from "../../../../commands/editorCommands";
import type { ClassView, StyleView } from "../../../../views/schema";

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

export function toClassStyleSaveTransaction(
  classView: ClassView,
  styles: readonly StyleView[]
): EditorCommandTransaction {
  return [
    {
      type: "style.definition.create",
      name: toUniqueStyleName(styles),
      sourceKind: "classDef",
      properties: classView.style ?? EMPTY_STYLE,
      applyToClassIds: [classView.classId],
    },
    { type: "class.directStyle.clear", classId: classView.classId },
  ];
}

// Private helpers
const EMPTY_STYLE: StyleProperties = {
  fill: null,
  stroke: null,
  strokeWidth: null,
  strokeDasharray: null,
  color: null,
};

function toUniqueStyleName(styles: readonly StyleView[]): string {
  const names = new Set(styles.map((styleView) => styleView.name));
  let index = 1;
  while (names.has(`style${index}`)) index += 1;
  return `style${index}`;
}
