/**
 * @fileoverview Editor command transactions derived by the missing-annotations editor state.
 */

import type { EditorCommandTransaction } from "../../commands/editorCommands";
import type { ClassView, EditorViewModel } from "../../views/schema";

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 150;
const MARGIN = 40;

// @job logic:command:derive
export function toMissingAnnotationTransaction({
  missingClassIds,
  diagram,
}: Pick<
  Extract<EditorViewModel, { readonly status: "missingAnnotations" }>,
  "missingClassIds" | "diagram"
>): EditorCommandTransaction {
  const startY = computeStartY(diagram.classes);

  return missingClassIds.flatMap((classId, index) => {
    const x = MARGIN + index * (DEFAULT_WIDTH + MARGIN);
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
        size: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
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
  return maxBottom > 0 ? maxBottom + MARGIN : MARGIN;
}
