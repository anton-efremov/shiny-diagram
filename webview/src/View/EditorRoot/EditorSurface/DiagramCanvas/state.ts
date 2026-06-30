/**
 * @state ClassBoxPlacementState initial value from canonical class views.
 */

import type { ClassBoxPlacementState } from "../../../state/editorStates";
import type { ClassView } from "../../../views/schema";

/** Initial state: framework-neutral class box positions and dimensions */
export function toInitialClassBoxPlacementState(
  classes: readonly ClassView[]
): ClassBoxPlacementState {
  return {
    rectByClassId: new Map(classes.map((c) => [c.classId, c.bounds])),
  };
}
