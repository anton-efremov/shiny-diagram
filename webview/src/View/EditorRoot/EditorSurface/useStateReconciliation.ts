/**
 * @behavior SelectionState reconciliation when selected classes disappear from the diagram view.
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
  const classIds = reconcileSelectedClassIds(selectionState.classIds, diagram);
  return areClassIdCollectionsEqual(selectionState.classIds, classIds)
    ? selectionState
    : toClassOnlySelectionState(classIds);
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

function toClassOnlySelectionState(classIds: readonly ClassId[]): SelectionState {
  return {
    classIds,
    relationshipIds: [],
    namespaceIds: [],
    noteIds: [],
  };
}
