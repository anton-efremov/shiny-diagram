/**
 * @fileoverview ClassBox editor commands.
 * Extracted because ClassBox is an exclusively owned child of ReactFlowClassBoxNodeAdapter.
 */

import type { Rect } from "../../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../../shared/ids";

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

// @job-helper logic:command:derive
export function toClassResizeCommand(classId: ClassId, rect: Rect): ClassBoxCommand {
  return { type: "class.resize", classId, rect };
}
