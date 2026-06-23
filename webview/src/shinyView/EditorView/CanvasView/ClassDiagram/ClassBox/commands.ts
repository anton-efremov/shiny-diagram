/**
 * @fileoverview Editor commands owned by class-box interactions.
 */

import type { Rect } from "../../../../../shared/geometry";
import type { ClassId } from "../../../../../shared/ids";

export type ClassBoxCommand = {
  readonly type: "class.resize";
  readonly classId: ClassId;
  readonly rect: Rect;
};

export type ClassHeaderCommand = {
  readonly type: "class.header.setLabel";
  readonly classId: ClassId;
  readonly label: string;
};
