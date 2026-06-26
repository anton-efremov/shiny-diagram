/**
 * @fileoverview Ready editor transient UI state.
 */

import type { ClassId } from "../../../shared/ids";
import type { NodePlacementState, SelectionState } from "../../state/editorStates";
import type { ElementViews } from "../views";

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
      readonly elements: ElementViews | null;
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

// @job logic:state:initialize
export const initialSelectionState: SelectionState = {
  classIds: [],
  relationshipIds: [],
  namespaceIds: [],
  noteIds: [],
};

// @job logic:state:initialize
export const initialNodePlacementState: NodePlacementState = null;

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
  elements: ElementViews | null
): SelectionState {
  const classIds = reconcileSelectedClassIds(selectionState.classIds, elements);
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
  elements: ElementViews | null
): readonly ClassId[] {
  if (!elements) return selectedClassIds.length === 0 ? selectedClassIds : [];

  const classIds = elements.classes.map((classView) => classView.classId);
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
