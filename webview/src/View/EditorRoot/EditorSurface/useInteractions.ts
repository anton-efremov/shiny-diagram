/**
 * @behavior Ready editor selection and placement semantic handlers.
 * @state SelectionState and NodePlacementState updates.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClassId } from "../../../shared/ids";
import type { NodePlacementState, SelectionState } from "../../state/editorStates";

type Interactions = {
  readonly onClassPlacementStart: () => void;
  readonly onSelectionChange: (classIds: readonly ClassId[]) => void;
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

  const onSelectionChange = useCallback(
    (classIds: readonly ClassId[]) => {
      setSelectionState((state) => updateSelectedClassIds(state, classIds));
    },
    [setSelectionState]
  );

  const onSelectionClear = useCallback(() => {
    setSelectionState((state) => updateSelectedClassIds(state, []));
  }, [setSelectionState]);

  const onPlacementComplete = useCallback(() => {
    setNodePlacementState((state) => updateNodePlacementState(state, null));
  }, [setNodePlacementState]);

  return {
    onClassPlacementStart,
    onSelectionChange,
    onSelectionClear,
    onPlacementComplete,
  };
}

// Private helpers
function updateSelectedClassIds(
  selectionState: SelectionState,
  classIds: readonly ClassId[]
): SelectionState {
  return areClassIdCollectionsEqual(selectionState.classIds, classIds)
    ? selectionState
    : toClassOnlySelectionState(classIds);
}

function updateNodePlacementState(
  state: NodePlacementState,
  nodePlacementState: NodePlacementState
): NodePlacementState {
  return state === nodePlacementState ? state : nodePlacementState;
}

function toClassOnlySelectionState(classIds: readonly ClassId[]): SelectionState {
  return {
    classIds,
    relationshipIds: [],
    namespaceIds: [],
    noteIds: [],
  };
}

function areClassIdCollectionsEqual(left: readonly ClassId[], right: readonly ClassId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
