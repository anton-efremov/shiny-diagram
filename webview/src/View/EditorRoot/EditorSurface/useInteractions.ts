/**
 * @behavior Ready editor selection and placement semantic handlers.
 * @state SelectionState and NodePlacementState updates.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClassId, StyleDefId } from "../../../shared/ids";
import type { NodePlacementState, SelectionState } from "../../state/editorStates";

type Interactions = {
  readonly onClassPlacementStart: () => void;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
  readonly onSelectionClear: () => void;
  readonly onPlacementComplete: () => void;
};

type UseInteractionsInput = {
  readonly setSelectionState: Dispatch<SetStateAction<SelectionState>>;
  readonly setNodePlacementState: Dispatch<SetStateAction<NodePlacementState>>;
};

export function useInteractions({
  setSelectionState,
  setNodePlacementState,
}: UseInteractionsInput): Interactions {
  // Event handler props derivation
  const onClassPlacementStart = useCallback(() => {
    setNodePlacementState((state) => updateNodePlacementState(state, "class"));
  }, [setNodePlacementState]);

  const onClassSelect = useCallback(
    (classId: ClassId, additive: boolean) => {
      setSelectionState((state) => updateSelectedClassIds(state, classId, additive));
    },
    [setSelectionState]
  );

  const onStyleSelect = useCallback(
    (styleDefId: StyleDefId) => {
      setSelectionState((state) => updateSelectedStyleDefId(state, styleDefId));
    },
    [setSelectionState]
  );

  const onSelectionClear = useCallback(() => {
    setSelectionState((state) => clearSelectionState(state));
  }, [setSelectionState]);

  const onPlacementComplete = useCallback(() => {
    setNodePlacementState((state) => updateNodePlacementState(state, null));
  }, [setNodePlacementState]);

  return {
    onClassPlacementStart,
    onClassSelect,
    onStyleSelect,
    onSelectionClear,
    onPlacementComplete,
  };
}

// Private helpers
function updateSelectedClassIds(
  selectionState: SelectionState,
  classId: ClassId,
  additive: boolean
): SelectionState {
  const classIds =
    selectionState.kind === "classes" && additive
      ? toToggledClassIds(selectionState.classIds, classId)
      : [classId];
  return selectionState.kind === "classes" &&
    areClassIdCollectionsEqual(selectionState.classIds, classIds)
    ? selectionState
    : toClassSelectionState(classIds);
}

function updateNodePlacementState(
  state: NodePlacementState,
  nodePlacementState: NodePlacementState
): NodePlacementState {
  return state === nodePlacementState ? state : nodePlacementState;
}

function toClassSelectionState(classIds: readonly ClassId[]): SelectionState {
  return classIds.length === 0 ? { kind: "none" } : { kind: "classes", classIds };
}

function toToggledClassIds(
  selectedClassIds: readonly ClassId[],
  classId: ClassId
): readonly ClassId[] {
  return selectedClassIds.includes(classId)
    ? selectedClassIds.filter((selectedClassId) => selectedClassId !== classId)
    : [...selectedClassIds, classId];
}

function updateSelectedStyleDefId(
  selectionState: SelectionState,
  styleDefId: StyleDefId
): SelectionState {
  return selectionState.kind === "style" && selectionState.styleDefId === styleDefId
    ? selectionState
    : toStyleSelectionState(styleDefId);
}

function clearSelectionState(selectionState: SelectionState): SelectionState {
  return selectionState.kind === "none" ? selectionState : { kind: "none" };
}

function toStyleSelectionState(styleDefId: StyleDefId): SelectionState {
  return { kind: "style", styleDefId };
}

function areClassIdCollectionsEqual(left: readonly ClassId[], right: readonly ClassId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
