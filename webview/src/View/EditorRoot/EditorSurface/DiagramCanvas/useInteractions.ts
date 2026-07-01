/**
 * @behavior Class box placement state updates and class move command dispatch handlers.
 * @state ClassBoxPlacementState updates from framework-neutral rect patches.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Rect } from "../../../../shared/geometry";
import type { ClassBoxPlacementState } from "../../../state/editorStates";
import type { ClassView } from "../../../views/schema";
import { toClassMoveTransaction } from "./transactions";
import { useDispatchTransaction } from "../../../contexts";

type ClassBoxPlacementChange = {
  readonly classId: ClassView["classId"];
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
};

type Interactions = {
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
};

type UseInteractionsInput = {
  readonly view: readonly ClassView[];
  readonly setClassBoxPlacementState: Dispatch<SetStateAction<ClassBoxPlacementState>>;
};

export function useInteractions({
  view,
  setClassBoxPlacementState,
}: UseInteractionsInput): Interactions {
  const dispatchCommand = useDispatchTransaction();

  // Event handler props derivation
  const onClassBoxPlacementChange = useCallback(
    (changes: readonly ClassBoxPlacementChange[]) => {
      setClassBoxPlacementState((state) => applyClassBoxPlacementChanges(state, changes));
    },
    [setClassBoxPlacementState]
  );

  const onDragComplete = useCallback(
    (finalPositions: readonly ClassBoxPlacementChange[]) => {
      const moves = finalPositions.flatMap((pos) => {
        const classView = view.find((candidate) => candidate.classId === pos.classId);
        if (!classView) return [];
        if (pos.x === undefined || pos.y === undefined) return [];
        return [
          {
            classId: pos.classId,
            position: { x: pos.x, y: pos.y },
            size: { width: classView.bounds.w, height: classView.bounds.h },
          },
        ];
      });
      if (moves.length > 0) {
        // Implementing interaction through command transaction
        dispatchCommand(toClassMoveTransaction(moves));
      }
    },
    [view, dispatchCommand]
  );

  return { onClassBoxPlacementChange, onDragComplete };
}

// Private helpers
function applyClassBoxPlacementChanges(
  state: ClassBoxPlacementState,
  changes: readonly ClassBoxPlacementChange[]
): ClassBoxPlacementState {
  let next: Map<ClassView["classId"], Rect> | null = null;

  for (const change of changes) {
    const existing = (next ?? state.rectByClassId).get(change.classId);
    if (!existing) continue;

    const changedRect = {
      ...existing,
      x: change.x ?? existing.x,
      y: change.y ?? existing.y,
      w: change.w ?? existing.w,
      h: change.h ?? existing.h,
    };
    if (
      existing.x === changedRect.x &&
      existing.y === changedRect.y &&
      existing.w === changedRect.w &&
      existing.h === changedRect.h
    ) {
      continue;
    }

    next ??= new Map(state.rectByClassId);
    next.set(change.classId, changedRect);
  }
  return next ? { rectByClassId: next } : state;
}
