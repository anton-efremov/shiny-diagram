/**
 * @behavior Initial ClassBoxPlacementState from canonical class views.
 */

import type { ClassBoxPlacementState } from "../../../state/editorStates";
import type { ClassView } from "../../../views/schema";

// State initialization
export function toInitialClassBoxPlacementState(
  classes: readonly ClassView[]
): ClassBoxPlacementState {
  return {
    rectByClassId: new Map(classes.map((c) => [c.classId, c.bounds])),
  };
}
