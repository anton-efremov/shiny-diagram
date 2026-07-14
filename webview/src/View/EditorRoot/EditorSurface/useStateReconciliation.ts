/**
 * @behavior SelectionState and EditingState reconciliation when selected or edited targets disappear from the diagram view.
 */

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClassId } from "../../../shared/ids";
import type {
  EditingState,
  NamespaceGestureState,
  NoteAttachState,
  SelectionState,
} from "../../state/editorStates";
import type { ClassMemberView, DiagramView } from "../../views/schema";

type StateReconciliationInput = {
  readonly view: DiagramView;
  readonly setSelectionState: Dispatch<SetStateAction<SelectionState>>;
  readonly setEditingState: Dispatch<SetStateAction<EditingState>>;
  readonly setNoteAttachState: Dispatch<SetStateAction<NoteAttachState>>;
  readonly setNamespaceGestureState: Dispatch<SetStateAction<NamespaceGestureState>>;
};

// State reconciliation
export function useStateReconciliation({
  view,
  setSelectionState,
  setEditingState,
  setNoteAttachState,
  setNamespaceGestureState,
}: StateReconciliationInput): void {
  useEffect(() => {
    setSelectionState((state) => reconcileSelectionStateWithElements(state, view));
    setEditingState((state) => reconcileEditingStateWithElements(state, view));
    setNoteAttachState((state) => reconcileNoteAttachStateWithElements(state, view));
    setNamespaceGestureState((state) => reconcileNamespaceGestureStateWithElements(state, view));
  }, [view, setEditingState, setNamespaceGestureState, setNoteAttachState, setSelectionState]);
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
      return diagram.styles.some(
        (styleView) =>
          styleView.kind === "declared" && styleView.styleDefId === selectionState.styleDefId
      )
        ? selectionState
        : { kind: "none" };
    case "relationship":
      return diagram.relationships.some(
        (relationshipView) => relationshipView.relationshipId === selectionState.relationshipId
      )
        ? selectionState
        : { kind: "none" };
    case "note":
      return diagram.notes.some((noteView) => noteView.noteId === selectionState.noteId)
        ? selectionState
        : { kind: "none" };
    case "namespace":
      return diagram.namespaces.some(
        (namespaceView) => namespaceView.namespaceId === selectionState.namespaceId
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
  diagram: DiagramView
): EditingState {
  if (editingState.kind === "none") return editingState;
  if (editingState.kind === "noteText") {
    return diagram.notes.some((noteView) => noteView.noteId === editingState.noteId)
      ? editingState
      : { kind: "none" };
  }
  if (editingState.kind === "namespaceName") {
    return diagram.namespaces.some(
      (namespaceView) => namespaceView.namespaceId === editingState.namespaceId
    )
      ? editingState
      : { kind: "none" };
  }
  const classView = diagram.classes.find((candidate) => candidate.classId === editingState.classId);
  if (!classView) return { kind: "none" };
  if (editingState.kind === "header" || editingState.kind === "newMember") return editingState;
  return hasMember(classView.members, editingState) ? editingState : { kind: "none" };
}

function reconcileNoteAttachStateWithElements(
  noteAttachState: NoteAttachState,
  diagram: DiagramView
): NoteAttachState {
  if (noteAttachState.kind === "none") return noteAttachState;
  return diagram.notes.some((noteView) => noteView.noteId === noteAttachState.noteId)
    ? noteAttachState
    : { kind: "none" };
}

function reconcileNamespaceGestureStateWithElements(
  namespaceGestureState: NamespaceGestureState,
  diagram: DiagramView
): NamespaceGestureState {
  if (namespaceGestureState.kind !== "resizing") return namespaceGestureState;
  return diagram.namespaces.some(
    (namespaceView) => namespaceView.namespaceId === namespaceGestureState.namespaceId
  )
    ? namespaceGestureState
    : { kind: "none" };
}

function hasMember(
  members: readonly ClassMemberView[],
  editingState: Extract<EditingState, { readonly kind: "member" }>
): boolean {
  return members.some(
    (member) => member.memberId === editingState.memberId && member.kind === editingState.memberKind
  );
}
