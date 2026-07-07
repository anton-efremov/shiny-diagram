/**
 * @behavior SelectionState and NodePlacementState construction for the ready editor.
 */

import type { NodePlacementState, SelectionState } from "../../state/editorStates";

// State initialization
export function toInitialSelectionState(): SelectionState {
  return { kind: "none" };
}

export function toInitialNodePlacementState(): NodePlacementState {
  return null;
}
