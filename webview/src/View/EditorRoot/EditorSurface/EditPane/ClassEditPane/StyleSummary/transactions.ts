/**
 * @behavior Save direct class style as named style transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";
import type { ClassView } from "../../../../../views/schema";
import type { StyleProperties } from "../../../../../../shared/style";

export function toStyleSaveTransaction(
  selectedClasses: readonly ClassView[],
  name: string,
  properties: StyleProperties
): EditorCommandTransaction {
  return [
    {
      type: "style.definition.create",
      name,
      sourceKind: "classDef",
      properties,
      applyToClassIds: selectedClasses.map((classView) => classView.classId),
    },
    ...selectedClasses.map((classView) => ({
      type: "class.directStyle.clear" as const,
      classId: classView.classId,
    })),
  ];
}
