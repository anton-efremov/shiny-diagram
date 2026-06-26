/**
 * @fileoverview Framework-neutral layout state for ClassDiagram.
 */

import type { Rect } from "../../../../shared/geometry";
import type { ClassBoxLayoutState } from "../../../state/editorStates";
import type { ClassDiagramView } from "./views";

type ClassDiagramClassView = ClassDiagramView["elements"]["classes"][number];

export type ClassPositionChange = {
  readonly classId: ClassDiagramClassView["classId"];
  readonly x: number;
  readonly y: number;
};

// @job logic:state:initialize
export function createInitialClassBoxLayoutState(
  classes: readonly ClassDiagramClassView[]
): ClassBoxLayoutState {
  return {
    rectByClassId: new Map(classes.map((c) => [c.classId, { x: c.x, y: c.y, w: c.w, h: c.h }])),
  };
}

// @job logic:state:reconcile
export function reconcileLayoutWithClassViews(
  state: ClassBoxLayoutState,
  classes: readonly ClassDiagramClassView[]
): ClassBoxLayoutState {
  if (isLayoutEquivalentToViews(state.rectByClassId, classes)) return state;
  return {
    rectByClassId: new Map(classes.map((c) => [c.classId, { x: c.x, y: c.y, w: c.w, h: c.h }])),
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
  rectByClassId: ReadonlyMap<ClassDiagramClassView["classId"], Rect>,
  classes: readonly ClassDiagramClassView[]
): boolean {
  if (rectByClassId.size !== classes.length) return false;
  return classes.every((c) => {
    const entry = rectByClassId.get(c.classId);
    return (
      entry !== undefined &&
      entry.x === c.x &&
      entry.y === c.y &&
      entry.w === c.w &&
      entry.h === c.h
    );
  });
}
