/**
 * @behavior SelectionState reconciliation when selected classes or styles disappear from the diagram view.
 */

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClassId, StyleDefId } from "../../../shared/ids";
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
  const styleDefIds = reconcileSelectedStyleDefIds(selectionState.styleDefIds, diagram);
  return areClassIdCollectionsEqual(selectionState.classIds, classIds) &&
    areStyleDefIdCollectionsEqual(selectionState.styleDefIds, styleDefIds)
    ? selectionState
    : toSelectionState(classIds, styleDefIds);
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

function reconcileSelectedStyleDefIds(
  selectedStyleDefIds: readonly StyleDefId[],
  diagram: DiagramView
): readonly StyleDefId[] {
  const styleDefIds = diagram.styles.map((styleView) => styleView.styleId);
  if (selectedStyleDefIds.length === 0 || styleDefIds.length === 0) {
    return selectedStyleDefIds.length === 0 ? selectedStyleDefIds : [];
  }

  const selected = new Set(selectedStyleDefIds);
  return styleDefIds.flatMap((styleDefId) => (selected.has(styleDefId) ? [styleDefId] : []));
}

function areStyleDefIdCollectionsEqual(
  left: readonly StyleDefId[],
  right: readonly StyleDefId[]
): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function toSelectionState(
  classIds: readonly ClassId[],
  styleDefIds: readonly StyleDefId[]
): SelectionState {
  return {
    classIds,
    relationshipIds: [],
    namespaceIds: [],
    noteIds: [],
    styleDefIds,
  };
}
