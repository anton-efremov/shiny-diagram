/**
 * @behavior SelectionState and EditingState reconciliation when selected or edited targets disappear from the diagram view.
 */

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClassId } from "../../../shared/ids";
import type { EditingState, SelectionState } from "../../state/editorStates";
import type { ClassMemberView, ClassView, DiagramView } from "../../views/schema";

type StateReconciliationInput = {
  readonly view: DiagramView;
  readonly setSelectionState: Dispatch<SetStateAction<SelectionState>>;
  readonly setEditingState: Dispatch<SetStateAction<EditingState>>;
};

// State reconciliation
export function useStateReconciliation({
  view,
  setSelectionState,
  setEditingState,
}: StateReconciliationInput): void {
  useEffect(() => {
    setSelectionState((state) => reconcileSelectionStateWithElements(state, view));
    setEditingState((state) => reconcileEditingStateWithElements(state, view.classes));
  }, [view, setEditingState, setSelectionState]);
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

function reconcileEditingStateWithElements(
  editingState: EditingState,
  classes: readonly ClassView[]
): EditingState {
  if (editingState.kind === "none") return editingState;
  const classView = classes.find((candidate) => candidate.classId === editingState.classId);
  if (!classView) return { kind: "none" };
  if (editingState.kind === "header" || editingState.kind === "newMember") return editingState;
  return hasMember(classView.members, editingState) ? editingState : { kind: "none" };
}

function hasMember(
  members: readonly ClassMemberView[],
  editingState: Extract<EditingState, { readonly kind: "member" }>
): boolean {
  return members.some(
    (member) => member.memberId === editingState.memberId && member.kind === editingState.memberKind
  );
}
