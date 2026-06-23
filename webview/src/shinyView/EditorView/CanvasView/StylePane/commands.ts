/**
 * @fileoverview Editor commands owned by the class style inspector.
 */

import type { ClassId } from "../../../../shared/ids";

export type StyleCommand = {
  readonly type: "style.setClassProperty";
  readonly classIds: readonly ClassId[];
  readonly property: "fill" | "stroke" | "color";
  readonly value: string;
};

export type ClassDeleteCommand = {
  readonly type: "class.delete";
  readonly classIds: readonly ClassId[];
};

export type ClassDuplicateCommand = {
  readonly type: "class.duplicate";
  readonly classIds: readonly ClassId[];
};
