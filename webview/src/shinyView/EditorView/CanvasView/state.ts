/**
 * @state selectionState and nodePlacementState initial values.
 */

import type { NodePlacementState, SelectionState } from "../../state/editorStates";

/** Initial state: selected editor entities */
export function toInitialSelectionState(): SelectionState {
  return {
    classIds: [],
    relationshipIds: [],
    namespaceIds: [],
    noteIds: [],
  };
}

/** Initial state: active node placement kind */
export function toInitialNodePlacementState(): NodePlacementState {
  return null;
}
