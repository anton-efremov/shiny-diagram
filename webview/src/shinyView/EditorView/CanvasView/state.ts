/**
 * @fileoverview Ready editor transient UI state.
 */

import type { ClassId } from "../../../shared/ids";
import type { NodePlacementState, SelectionState } from "../../state/editorStates";
import type { DiagramView } from "../../views/schema";

export type CanvasViewStateAction =
  | {
      readonly type: "selection.setClassIds";
      readonly classIds: readonly ClassId[];
    }
  | {
      readonly type: "selection.clearClassIds";
    }
  | {
      readonly type: "selection.reconcileClassIds";
      readonly diagram: DiagramView | null;
    }
  | {
      readonly type: "placement.setMode";
      readonly nodePlacementState: Exclude<NodePlacementState, null>;
    }
  | {
      readonly type: "placement.complete";
    }
  | {
      readonly type: "placement.cancel";
    };

export type CanvasViewState = {
  readonly selectionState: SelectionState;
  readonly nodePlacementState: NodePlacementState;
};

// @job logic:state:initialize
export const initialSelectionState: SelectionState = {
  classIds: [],
  relationshipIds: [],
  namespaceIds: [],
  noteIds: [],
};

// @job logic:state:initialize
export const initialNodePlacementState: NodePlacementState = null;

// @job logic:state:initialize
export const initialCanvasViewState: CanvasViewState = {
  selectionState: initialSelectionState,
  nodePlacementState: initialNodePlacementState,
};

// @job logic:state:update
export function canvasViewReducer(
  state: CanvasViewState,
  action: CanvasViewStateAction
): CanvasViewState {
  switch (action.type) {
    case "selection.setClassIds":
      return {
        ...state,
        selectionState: updateSelectedClassIds(state.selectionState, action.classIds),
      };
    case "selection.clearClassIds":
      return {
        ...state,
        selectionState: updateSelectedClassIds(state.selectionState, []),
      };
    case "selection.reconcileClassIds":
      return {
        ...state,
        selectionState: reconcileSelectionStateWithElements(state.selectionState, action.diagram),
      };
    case "placement.setMode":
      return {
        ...state,
        nodePlacementState: updateNodePlacementState(
          state.nodePlacementState,
          action.nodePlacementState
        ),
      };
    case "placement.complete":
    case "placement.cancel":
      return {
        ...state,
        nodePlacementState: updateNodePlacementState(state.nodePlacementState, null),
      };
  }
}

// @job logic:state:update
export function toClassOnlySelectionState(classIds: readonly ClassId[]): SelectionState {
  return {
    classIds,
    relationshipIds: [],
    namespaceIds: [],
    noteIds: [],
  };
}

// @job logic:state:update
export function updateSelectedClassIds(
  selectionState: SelectionState,
  classIds: readonly ClassId[]
): SelectionState {
  return areClassIdCollectionsEqual(selectionState.classIds, classIds)
    ? selectionState
    : toClassOnlySelectionState(classIds);
}

// @job logic:state:reconcile
export function reconcileSelectionStateWithElements(
  selectionState: SelectionState,
  diagram: DiagramView | null
): SelectionState {
  const classIds = reconcileSelectedClassIds(selectionState.classIds, diagram);
  return areClassIdCollectionsEqual(selectionState.classIds, classIds)
    ? selectionState
    : toClassOnlySelectionState(classIds);
}

// @job logic:state:update
export function updateNodePlacementState(
  state: NodePlacementState,
  nodePlacementState: NodePlacementState
): NodePlacementState {
  return state === nodePlacementState ? state : nodePlacementState;
}

export function canHandleClassSelectionShortcut(selectionState: SelectionState): boolean {
  return (
    selectionState.classIds.length > 0 &&
    selectionState.relationshipIds.length === 0 &&
    selectionState.namespaceIds.length === 0 &&
    selectionState.noteIds.length === 0
  );
}

export function isClassOnlyPlacementActive(nodePlacementState: NodePlacementState): boolean {
  return nodePlacementState === "class";
}

function reconcileSelectedClassIds(
  selectedClassIds: readonly ClassId[],
  diagram: DiagramView | null
): readonly ClassId[] {
  if (!diagram) return selectedClassIds.length === 0 ? selectedClassIds : [];

  const classIds = diagram.classes.map((classView) => classView.classId);
  if (selectedClassIds.length === 0 || classIds.length === 0)
    return selectedClassIds.length === 0 ? selectedClassIds : [];

  const selected = new Set(selectedClassIds);
  return classIds.flatMap((classId) => (selected.has(classId) ? [classId] : []));
}

export function areClassIdCollectionsEqual(
  left: readonly ClassId[],
  right: readonly ClassId[]
): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
