/**
 * @fileoverview Framework-neutral layout state for ClassDiagram.
 */

import type { Rect } from "../../../../shared/geometry";
import type { ClassBoxLayoutState } from "../../../state/editorStates";
import type { ClassView } from "../../../views/schema";

export type ClassPositionChange = {
  readonly classId: ClassView["classId"];
  readonly x: number;
  readonly y: number;
};

// @job logic:state:initialize
export function createInitialClassBoxLayoutState(
  classes: readonly ClassView[]
): ClassBoxLayoutState {
  return {
    rectByClassId: new Map(classes.map((c) => [c.classId, c.bounds])),
  };
}

// @job logic:state:reconcile
export function reconcileLayoutWithClassViews(
  state: ClassBoxLayoutState,
  classes: readonly ClassView[]
): ClassBoxLayoutState {
  if (isLayoutEquivalentToViews(state.rectByClassId, classes)) return state;
  return {
    rectByClassId: new Map(classes.map((c) => [c.classId, c.bounds])),
  };
}

// @job logic:state:update
export function applyPositionChanges(
  state: ClassBoxLayoutState,
  changes: readonly ClassPositionChange[]
): ClassBoxLayoutState {
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

function isLayoutEquivalentToViews(
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
