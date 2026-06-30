/**
 * @behavior Initial SelectionState and NodePlacementState values for the ready editor.
 */

import type { NodePlacementState, SelectionState } from "../../state/editorStates";

// State initialization
export function toInitialSelectionState(): SelectionState {
  return {
    classIds: [],
    relationshipIds: [],
    namespaceIds: [],
    noteIds: [],
  };
}

export function toInitialNodePlacementState(): NodePlacementState {
  return null;
}
