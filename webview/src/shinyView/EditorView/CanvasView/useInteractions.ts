/**
 * @logic CanvasView semantic interaction decisions for selection, placement, and class deletion.
 * @state selectionState and nodePlacementState updates.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClassId } from "../../../shared/ids";
import type { NodePlacementState, SelectionState } from "../../state/editorStates";
import { useDispatchTransaction } from "../contexts";
import { toClassDeleteTransaction } from "./transactions";

type Interactions = {
  readonly onClassPlacementStart: () => void;
  readonly onSelectionChange: (classIds: readonly ClassId[]) => void;
  readonly onSelectionClear: () => void;
  readonly onPlacementComplete: () => void;
  readonly onClassDelete: () => boolean;
};

type UseInteractionsInput = {
  readonly selectionState: SelectionState;
  readonly setSelectionState: Dispatch<SetStateAction<SelectionState>>;
  readonly setNodePlacementState: Dispatch<SetStateAction<NodePlacementState>>;
};

export function useInteractions({
  selectionState,
  setSelectionState,
  setNodePlacementState,
}: UseInteractionsInput): Interactions {
  const dispatchCommand = useDispatchTransaction();

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

  const onClassDelete = useCallback(() => {
    if (!canDeleteSelectedClasses(selectionState)) return false;

    dispatchCommand(toClassDeleteTransaction(selectionState.classIds));
    return true;
  }, [selectionState, dispatchCommand]);

  return {
    onClassPlacementStart,
    onSelectionChange,
    onSelectionClear,
    onPlacementComplete,
    onClassDelete,
  };
}

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

function canDeleteSelectedClasses(selectionState: SelectionState): boolean {
  return (
    selectionState.classIds.length > 0 &&
    selectionState.relationshipIds.length === 0 &&
    selectionState.namespaceIds.length === 0 &&
    selectionState.noteIds.length === 0
  );
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
