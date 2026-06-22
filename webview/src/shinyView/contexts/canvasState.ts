/**
 * @fileoverview View-owned canvas interaction state contract.
 */

import type { ClassId } from "../../shared/ids";

export type PlacementMode = "class";

export type CanvasState = {
  selectedClassIds: readonly ClassId[];
  placementMode: PlacementMode | null;
};

export const defaultCanvasState: CanvasState = { selectedClassIds: [], placementMode: null };
