/**
 * @logic ClassDiagram class box placement state updates and class move command dispatch decisions.
 * @state classBoxPlacementState updates from framework-neutral position changes.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClassBoxPlacementState } from "../../../state/editorStates";
import type { ClassView } from "../../../views/schema";
import { toClassMoveTransaction } from "./transactions";
import { useDispatchTransaction } from "../../../contexts";

type ClassBoxPlacementChange = {
  readonly classId: ClassView["classId"];
  readonly x: number;
  readonly y: number;
};

type Interactions = {
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
};

type UseInteractionsInput = {
  readonly view: readonly ClassView[];
  readonly setClassBoxPlacementState: Dispatch<SetStateAction<ClassBoxPlacementState>>;
};

/** ── interaction hook area ──
 * Patterns: 4.6-3, 4.8-2, 4.9-1
 */
export function useInteractions({
  view,
  setClassBoxPlacementState,
}: UseInteractionsInput): Interactions {
  const dispatchCommand = useDispatchTransaction();

  const onClassBoxPlacementChange = useCallback(
    (changes: readonly ClassBoxPlacementChange[]) => {
      setClassBoxPlacementState((state) => applyClassBoxPlacementChanges(state, changes));
    },
    [setClassBoxPlacementState]
  );

  const onDragComplete = useCallback(
    (finalPositions: readonly ClassBoxPlacementChange[]) => {
      const moves = finalPositions.flatMap((pos) => {
        if (!view.some((classView) => classView.classId === pos.classId)) return [];
        return [{ classId: pos.classId, position: { x: pos.x, y: pos.y } }];
      });
      if (moves.length > 0) {
        dispatchCommand(toClassMoveTransaction(moves));
      }
    },
    [view, dispatchCommand]
  );

  return { onClassBoxPlacementChange, onDragComplete };
}

function applyClassBoxPlacementChanges(
  state: ClassBoxPlacementState,
  changes: readonly ClassBoxPlacementChange[]
): ClassBoxPlacementState {
  let changed = false;
  const next = new Map(state.rectByClassId);
  for (const change of changes) {
    const existing = next.get(change.classId);
    if (!existing || (existing.x === change.x && existing.y === change.y)) continue;
    next.set(change.classId, { ...existing, x: change.x, y: change.y });
    changed = true;
  }
  return changed ? { rectByClassId: next } : state;
}
