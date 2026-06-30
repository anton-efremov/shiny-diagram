/**
 * @behavior ClassBoxPlacementState reconciliation when class views change.
 */

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Rect } from "../../../../shared/geometry";
import type { ClassBoxPlacementState } from "../../../state/editorStates";
import type { ClassView } from "../../../views/schema";

type StateReconciliationInput = {
  readonly view: readonly ClassView[];
  readonly setClassBoxPlacementState: Dispatch<SetStateAction<ClassBoxPlacementState>>;
};

// State reconciliation
export function useStateReconciliation({
  view,
  setClassBoxPlacementState,
}: StateReconciliationInput): void {
  useEffect(() => {
    setClassBoxPlacementState((state) => reconcileClassBoxPlacementWithClassViews(state, view));
  }, [view, setClassBoxPlacementState]);
}

// Private helpers
function reconcileClassBoxPlacementWithClassViews(
  state: ClassBoxPlacementState,
  classes: readonly ClassView[]
): ClassBoxPlacementState {
  if (isClassBoxPlacementEquivalentToViews(state.rectByClassId, classes)) return state;
  return {
    rectByClassId: new Map(classes.map((c) => [c.classId, c.bounds])),
  };
}

function isClassBoxPlacementEquivalentToViews(
  rectByClassId: ReadonlyMap<ClassView["classId"], Rect>,
  classes: readonly ClassView[]
): boolean {
  if (rectByClassId.size !== classes.length) return false;
  return classes.every((c) => {
    const entry = rectByClassId.get(c.classId);
    return (
      entry !== undefined &&
      entry.x === c.bounds.x &&
      entry.y === c.bounds.y &&
      entry.w === c.bounds.w &&
      entry.h === c.bounds.h
    );
  });
}
