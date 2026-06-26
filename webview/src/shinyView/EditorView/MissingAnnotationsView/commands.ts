/**
 * @fileoverview Editor command transactions derived by the missing-annotations editor state.
 */

import type { EditorCommandTransaction } from "../../commands/editorCommands";
import type { MissingAnnotationClassView, MissingAnnotationsViewModel } from "./views";

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 150;
const MARGIN = 40;

// @job logic:command:derive
export function toMissingAnnotationTransaction({
  missingIds,
  classes,
}: MissingAnnotationsViewModel): EditorCommandTransaction {
  const startY = computeStartY(classes);

  return missingIds.flatMap((classId, index) => {
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

function computeStartY(classes: readonly MissingAnnotationClassView[]): number {
  let maxBottom = 0;
  for (const classView of classes) {
    const bottom = classView.y + classView.h;
    if (bottom > maxBottom) maxBottom = bottom;
  }
  return maxBottom > 0 ? maxBottom + MARGIN : MARGIN;
}
