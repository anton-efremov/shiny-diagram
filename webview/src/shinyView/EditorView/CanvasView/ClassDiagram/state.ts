/**
 * @fileoverview Framework-neutral layout state for ClassDiagram.
 */

import type { ClassId } from "../../../../shared/ids";
import type { ClassBoxView } from "./views";

export type ClassLayoutEntry = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

export type DiagramLayoutState = {
  readonly layoutByClassId: Map<ClassId, ClassLayoutEntry>;
};

export type ClassPositionChange = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
};

// @job logic:state:initialize
export function createInitialDiagramLayoutState(
  classes: readonly ClassBoxView[]
): DiagramLayoutState {
  return {
    layoutByClassId: new Map(classes.map((c) => [c.classId, { x: c.x, y: c.y, w: c.w, h: c.h }])),
  };
}

// @job logic:state:reconcile
export function reconcileLayoutWithClassViews(
  state: DiagramLayoutState,
  classes: readonly ClassBoxView[]
): DiagramLayoutState {
  if (isLayoutEquivalentToViews(state.layoutByClassId, classes)) return state;
  return {
    layoutByClassId: new Map(classes.map((c) => [c.classId, { x: c.x, y: c.y, w: c.w, h: c.h }])),
  };
}

// @job logic:state:update
export function applyPositionChanges(
  state: DiagramLayoutState,
  changes: readonly ClassPositionChange[]
): DiagramLayoutState {
  let changed = false;
  const next = new Map(state.layoutByClassId);
  for (const change of changes) {
    const existing = next.get(change.classId);
    if (!existing || (existing.x === change.x && existing.y === change.y)) continue;
    next.set(change.classId, { ...existing, x: change.x, y: change.y });
    changed = true;
  }
  return changed ? { layoutByClassId: next } : state;
}

function isLayoutEquivalentToViews(
  layoutByClassId: Map<ClassId, ClassLayoutEntry>,
  classes: readonly ClassBoxView[]
): boolean {
  if (layoutByClassId.size !== classes.length) return false;
  return classes.every((c) => {
    const entry = layoutByClassId.get(c.classId);
    return (
      entry !== undefined &&
      entry.x === c.x &&
      entry.y === c.y &&
      entry.w === c.w &&
      entry.h === c.h
    );
  });
}
