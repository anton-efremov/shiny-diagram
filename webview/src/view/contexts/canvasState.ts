import type { ClassId } from "../../primitives";

export type CanvasState = {
  selectedClassId: ClassId | null;
};

export const defaultCanvasState: CanvasState = { selectedClassId: null };
