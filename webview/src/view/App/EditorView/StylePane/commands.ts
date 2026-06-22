/**
 * @fileoverview Editor commands owned by the class style inspector.
 */

import type { ClassId } from "../../../../shared/ids";
import type { StylePropertyName } from "../../../../shared/styleTypes";

export type StyleCommand = {
  readonly type: "style.setClassProperty";
  readonly classId: ClassId;
  readonly property: StylePropertyName;
  readonly value: string;
};

export type ClassDeleteCommand = {
  readonly type: "class.delete";
  readonly classId: ClassId;
};

export type ClassDuplicateCommand = {
  readonly type: "class.duplicate";
  readonly classId: ClassId;
};
