/**
 * @fileoverview View-owned canvas interaction state contract.
 */

import type { ClassId } from "../../shared/ids";

export type CanvasState = {
  selectedClassId: ClassId | null;
};

export const defaultCanvasState: CanvasState = { selectedClassId: null };
