/**
 * @fileoverview View-owned canvas interaction state contract.
 */

import type { ClassId } from "../../shared/ids";

export type PlacementMode = "class";

export type CanvasState = {
  selectedClassId: ClassId | null;
  placementMode: PlacementMode | null;
};

export const defaultCanvasState: CanvasState = { selectedClassId: null, placementMode: null };
