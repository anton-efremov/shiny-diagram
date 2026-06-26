/**
 * @fileoverview Class style pane scenario render contract.
 */

import type { ClassStyleProperties } from "../../../../../shared/diagramVocabulary";
import type { Point, Size } from "../../../../../shared/geometry";
import type { ClassId } from "../../../../../shared/ids";

export type ClassStylePaneView = {
  readonly selectedClasses: readonly ClassStyleTargetView[];
};

export type ClassStyleTargetView = {
  readonly classId: ClassId;
  readonly label: string;
  readonly stereotype?: string;
  readonly styleName?: string;
  readonly style: ClassStyleProperties;
  readonly position: Point;
  readonly size: Size;
};
