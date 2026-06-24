/**
 * @fileoverview Ready editor transient UI state.
 */

import type { ClassId } from "../../../shared/ids";
import type { ElementViews } from "../views";

export type PlacementMode = "class";

export type EditorState = {
  readonly selectedClassIds: readonly ClassId[];
  readonly placementMode: PlacementMode | null;
};

export type EditorStateAction =
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
      readonly placementMode: PlacementMode;
    }
  | {
      readonly type: "placement.complete";
    }
  | {
      readonly type: "placement.cancel";
    };

// @job-helper logic:state:initialize
export const initialEditorState: EditorState = {
  selectedClassIds: [],
  placementMode: null,
};

// @job-helper logic:state:transform
export function editorStateReducer(state: EditorState, action: EditorStateAction): EditorState {
  switch (action.type) {
    case "selection.setClassIds":
      return updateSelectedClassIds(state, action.classIds);
    case "selection.clearClassIds":
      return updateSelectedClassIds(state, []);
    case "selection.reconcileClassIds":
      return updateSelectedClassIds(
        state,
        reconcileSelectedClassIds(state.selectedClassIds, action.elements)
      );
    case "placement.setMode":
      return state.placementMode === action.placementMode
        ? state
        : { ...state, placementMode: action.placementMode };
    case "placement.complete":
    case "placement.cancel":
      return state.placementMode === null ? state : { ...state, placementMode: null };
  }
}

// @job-helper logic:state:transform
function updateSelectedClassIds(
  state: EditorState,
  selectedClassIds: readonly ClassId[]
): EditorState {
  return areClassIdCollectionsEqual(state.selectedClassIds, selectedClassIds)
    ? state
    : { ...state, selectedClassIds };
}

// @job-helper logic:state:reconcile
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

function areClassIdCollectionsEqual(left: readonly ClassId[], right: readonly ClassId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
