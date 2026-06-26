/**
 * @fileoverview Editor command transactions derived by the missing-annotations editor state.
 */

import type { ClassId } from "../../../shared/ids";
import type { EditorCommandTransaction } from "../../commands/editorCommands";
import type { ElementViews } from "../views";

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 150;
const MARGIN = 40;

// @job logic:command:derive
export function toMissingAnnotationTransaction({
  missingIds,
  elements,
}: {
  readonly missingIds: readonly ClassId[];
  readonly elements: ElementViews;
}): EditorCommandTransaction {
  const startY = computeStartY(elements.classes);

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

function computeStartY(classes: ElementViews["classes"]): number {
  let maxBottom = 0;
  for (const classView of classes) {
    const bottom = classView.y + classView.h;
    if (bottom > maxBottom) maxBottom = bottom;
  }
  return maxBottom > 0 ? maxBottom + MARGIN : MARGIN;
}
