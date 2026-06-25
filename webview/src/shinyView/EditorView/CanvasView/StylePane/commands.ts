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

// @job logic:command:derive
export function toStyleSetClassPropertyCommand({
  selectedClassIds,
  property,
  value,
}: {
  readonly selectedClassIds: readonly ClassId[];
  readonly property: StyleCommand["property"];
  readonly value: string;
}): StyleCommand | null {
  if (selectedClassIds.length === 0) return null;
  return {
    type: "style.setClassProperty",
    classIds: selectedClassIds,
    property,
    value,
  };
}

export function toClassDeleteCommand(
  selectedClassIds: readonly ClassId[]
): ClassDeleteCommand | null {
  if (selectedClassIds.length === 0) return null;
  return { type: "class.delete", classIds: selectedClassIds };
}

export function toClassDuplicateCommand(
  selectedClassIds: readonly ClassId[]
): ClassDuplicateCommand | null {
  if (selectedClassIds.length === 0) return null;
  return { type: "class.duplicate", classIds: selectedClassIds };
}
