/**
 * @behavior SelectionState reconciliation when selected classes, styles, or relationships disappear from the diagram view.
 */

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClassId } from "../../../shared/ids";
import type { SelectionState } from "../../state/editorStates";
import type { DiagramView } from "../../views/schema";

type StateReconciliationInput = {
  readonly view: DiagramView;
  readonly setSelectionState: Dispatch<SetStateAction<SelectionState>>;
};

// State reconciliation
export function useStateReconciliation({
  view,
  setSelectionState,
}: StateReconciliationInput): void {
  useEffect(() => {
    setSelectionState((state) => reconcileSelectionStateWithElements(state, view));
  }, [view, setSelectionState]);
}

// Private helpers
function reconcileSelectionStateWithElements(
  selectionState: SelectionState,
  diagram: DiagramView
): SelectionState {
  switch (selectionState.kind) {
    case "none":
      return selectionState;
    case "classes": {
      const classIds = reconcileSelectedClassIds(selectionState.classIds, diagram);
      return areClassIdCollectionsEqual(selectionState.classIds, classIds)
        ? selectionState
        : toClassSelectionState(classIds);
    }
    case "style":
      return diagram.styles.some((styleView) => styleView.styleId === selectionState.styleDefId)
        ? selectionState
        : { kind: "none" };
    case "relationship":
      return diagram.relationships.some(
        (relationshipView) => relationshipView.relationshipId === selectionState.relationshipId
      )
        ? selectionState
        : { kind: "none" };
  }
}

function reconcileSelectedClassIds(
  selectedClassIds: readonly ClassId[],
  diagram: DiagramView
): readonly ClassId[] {
  const classIds = diagram.classes.map((classView) => classView.classId);
  if (selectedClassIds.length === 0 || classIds.length === 0) {
    return selectedClassIds.length === 0 ? selectedClassIds : [];
  }

  const selected = new Set(selectedClassIds);
  return classIds.flatMap((classId) => (selected.has(classId) ? [classId] : []));
}

function areClassIdCollectionsEqual(left: readonly ClassId[], right: readonly ClassId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function toClassSelectionState(classIds: readonly ClassId[]): SelectionState {
  return classIds.length === 0 ? { kind: "none" } : { kind: "classes", classIds };
}
