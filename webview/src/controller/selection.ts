import type { ClassId } from "./model/primitives";

export type Selection = {
  readonly selectedClassId: ClassId | null;
};

export const emptySelection: Selection = { selectedClassId: null };

export type ActiveTool = string;
