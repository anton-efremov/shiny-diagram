/**
 * @fileoverview Class box layout algorithms for View-owned placement decisions.
 */

import type { Rect } from "../../../shared/geometry";
import type { ClassId } from "../../../shared/ids";
import type { ClassView } from "../../views/schema";
import {
  GENERATE_CLASS_HEIGHT,
  GENERATE_CLASS_MARGIN,
  GENERATE_CLASS_WIDTH,
} from "../../config/editorUiConfig";

export type MissingClassBoxLayout = {
  readonly classId: ClassId;
  readonly bounds: Rect;
};

export function calculateClassBoxLayouts(
  missingClassIds: readonly ClassId[],
  existingClasses: readonly ClassView[]
): readonly MissingClassBoxLayout[] {
  const startY = toNextRowY(existingClasses);

  return missingClassIds.map((classId, index) => ({
    classId,
    bounds: {
      x: GENERATE_CLASS_MARGIN + index * (GENERATE_CLASS_WIDTH + GENERATE_CLASS_MARGIN),
      y: startY,
      w: GENERATE_CLASS_WIDTH,
      h: GENERATE_CLASS_HEIGHT,
    },
  }));
}

function toNextRowY(classes: readonly ClassView[]): number {
  let maxBottom = 0;
  for (const classView of classes) {
    const bottom = classView.bounds.y + classView.bounds.h;
    if (bottom > maxBottom) maxBottom = bottom;
  }

  return maxBottom > 0 ? maxBottom + GENERATE_CLASS_MARGIN : GENERATE_CLASS_MARGIN;
}
