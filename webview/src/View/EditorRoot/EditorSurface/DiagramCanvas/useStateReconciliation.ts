/**
 * @behavior ClassBoxPlacementState and NoteBoxPlacementState reconciliation when node views change.
 */

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Rect } from "../../../../shared/geometry";
import type { ClassBoxPlacementState, NoteBoxPlacementState } from "../../../state/editorStates";
import type { ClassView, NoteView } from "../../../views/schema";
import { toInitialNoteBoxPlacementState } from "./state";

type StateReconciliationInput = {
  readonly view: readonly ClassView[];
  readonly notes: readonly NoteView[];
  readonly setClassBoxPlacementState: Dispatch<SetStateAction<ClassBoxPlacementState>>;
  readonly setNoteBoxPlacementState: Dispatch<SetStateAction<NoteBoxPlacementState>>;
};

// State reconciliation
export function useStateReconciliation({
  view,
  notes,
  setClassBoxPlacementState,
  setNoteBoxPlacementState,
}: StateReconciliationInput): void {
  useEffect(() => {
    setClassBoxPlacementState((state) => reconcileClassBoxPlacementWithClassViews(state, view));
    setNoteBoxPlacementState((state) => reconcileNoteBoxPlacementWithNoteViews(state, notes));
  }, [notes, setClassBoxPlacementState, setNoteBoxPlacementState, view]);
}

// Private helpers
function reconcileClassBoxPlacementWithClassViews(
  state: ClassBoxPlacementState,
  classes: readonly ClassView[]
): ClassBoxPlacementState {
  if (isClassBoxPlacementEquivalentToViews(state.rectByClassId, classes)) return state;
  return {
    rectByClassId: new Map(classes.map((c) => [c.classId, c.bounds])),
  };
}

function isClassBoxPlacementEquivalentToViews(
  rectByClassId: ReadonlyMap<ClassView["classId"], Rect>,
  classes: readonly ClassView[]
): boolean {
  if (rectByClassId.size !== classes.length) return false;
  return classes.every((c) => {
    const entry = rectByClassId.get(c.classId);
    return (
      entry !== undefined &&
      entry.x === c.bounds.x &&
      entry.y === c.bounds.y &&
      entry.w === c.bounds.w &&
      entry.h === c.bounds.h
    );
  });
}

function reconcileNoteBoxPlacementWithNoteViews(
  state: NoteBoxPlacementState,
  notes: readonly NoteView[]
): NoteBoxPlacementState {
  const next = toInitialNoteBoxPlacementState(notes);
  if (areRectMapsEqual(state.rectByNoteId, next.rectByNoteId)) return state;
  return next;
}

function areRectMapsEqual<Id>(left: ReadonlyMap<Id, Rect>, right: ReadonlyMap<Id, Rect>): boolean {
  if (left.size !== right.size) return false;
  for (const [id, leftRect] of left) {
    const rightRect = right.get(id);
    if (!rightRect) return false;
    if (
      leftRect.x !== rightRect.x ||
      leftRect.y !== rightRect.y ||
      leftRect.w !== rightRect.w ||
      leftRect.h !== rightRect.h
    ) {
      return false;
    }
  }
  return true;
}
