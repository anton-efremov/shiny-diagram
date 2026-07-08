/**
 * @behavior Class and note box placement state updates plus spatial command dispatch handlers.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Rect } from "../../../../shared/geometry";
import type { NoteId } from "../../../../shared/ids";
import type { ClassBoxPlacementState, NoteBoxPlacementState } from "../../../state/editorStates";
import type { ClassView, NoteView } from "../../../views/schema";
import { toClassMoveTransaction, toNoteMoveTransaction } from "./transactions";
import { useDispatchTransaction } from "../../../contexts";

type ClassBoxPlacementChange = {
  readonly classId: ClassView["classId"];
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
};

type NoteBoxPlacementChange = {
  readonly noteId: NoteId;
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
};

type Interactions = {
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onNoteBoxPlacementChange: (changes: readonly NoteBoxPlacementChange[]) => void;
  readonly onDragComplete: (
    finalPositions: readonly ClassBoxPlacementChange[],
    finalNotePositions: readonly NoteBoxPlacementChange[]
  ) => void;
};

type UseInteractionsInput = {
  readonly view: readonly ClassView[];
  readonly notes: readonly NoteView[];
  readonly setClassBoxPlacementState: Dispatch<SetStateAction<ClassBoxPlacementState>>;
  readonly setNoteBoxPlacementState: Dispatch<SetStateAction<NoteBoxPlacementState>>;
};

export function useInteractions({
  view,
  notes,
  setClassBoxPlacementState,
  setNoteBoxPlacementState,
}: UseInteractionsInput): Interactions {
  const dispatchCommand = useDispatchTransaction();

  // Event handler props derivation
  const onClassBoxPlacementChange = useCallback(
    (changes: readonly ClassBoxPlacementChange[]) => {
      setClassBoxPlacementState((state) => applyClassBoxPlacementChanges(state, changes));
    },
    [setClassBoxPlacementState]
  );

  const onNoteBoxPlacementChange = useCallback(
    (changes: readonly NoteBoxPlacementChange[]) => {
      setNoteBoxPlacementState((state) => applyNoteBoxPlacementChanges(state, changes));
    },
    [setNoteBoxPlacementState]
  );

  const onDragComplete = useCallback(
    (
      finalPositions: readonly ClassBoxPlacementChange[],
      finalNotePositions: readonly NoteBoxPlacementChange[]
    ) => {
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
      const noteMoves = finalNotePositions.flatMap((pos) => {
        const noteView = notes.find((candidate) => candidate.noteId === pos.noteId);
        if (!noteView) return [];
        if (
          pos.x === undefined ||
          pos.y === undefined ||
          pos.w === undefined ||
          pos.h === undefined
        ) {
          return [];
        }
        return [
          {
            noteId: pos.noteId,
            position: { x: pos.x, y: pos.y },
            size: { width: pos.w, height: pos.h },
          },
        ];
      });
      if (noteMoves.length > 0) {
        dispatchCommand(toNoteMoveTransaction(noteMoves));
      }
    },
    [dispatchCommand, notes, view]
  );

  return { onClassBoxPlacementChange, onNoteBoxPlacementChange, onDragComplete };
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

function applyNoteBoxPlacementChanges(
  state: NoteBoxPlacementState,
  changes: readonly NoteBoxPlacementChange[]
): NoteBoxPlacementState {
  let next: Map<NoteId, Rect> | null = null;

  for (const change of changes) {
    const existing = (next ?? state.rectByNoteId).get(change.noteId);
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

    next ??= new Map(state.rectByNoteId);
    next.set(change.noteId, changedRect);
  }
  return next ? { rectByNoteId: next } : state;
}
