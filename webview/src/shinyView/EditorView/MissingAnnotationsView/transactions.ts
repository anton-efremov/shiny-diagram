/**
 * @logic Missing spatial annotation transaction derivation.
 */

import type { EditorCommandTransaction } from "../../commands/editorCommands";
import {
  GENERATE_CLASS_HEIGHT,
  GENERATE_CLASS_MARGIN,
  GENERATE_CLASS_WIDTH,
} from "../../config/editorUiConfig";
import type { ClassView, EditorViewModel } from "../../views/schema";

export function toMissingAnnotationTransaction({
  missingClassIds,
  diagram,
}: Pick<
  Extract<EditorViewModel, { readonly status: "missingAnnotations" }>,
  "missingClassIds" | "diagram"
>): EditorCommandTransaction {
  const startY = computeStartY(diagram.classes);

  return missingClassIds.flatMap((classId, index) => {
    const x = GENERATE_CLASS_MARGIN + index * (GENERATE_CLASS_WIDTH + GENERATE_CLASS_MARGIN);
    const y = startY;

    return [
      {
        type: "class.position.set",
        classId,
        position: { x, y },
      },
      {
        type: "class.size.set",
        classId,
        size: { width: GENERATE_CLASS_WIDTH, height: GENERATE_CLASS_HEIGHT },
      },
    ];
  });
}

function computeStartY(classes: readonly ClassView[]): number {
  let maxBottom = 0;
  for (const classView of classes) {
    const bottom = classView.bounds.y + classView.bounds.h;
    if (bottom > maxBottom) maxBottom = bottom;
  }
  return maxBottom > 0 ? maxBottom + GENERATE_CLASS_MARGIN : GENERATE_CLASS_MARGIN;
}
