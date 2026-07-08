/**
 * @behavior SelectionState, NodePlacementState, and EditingState construction for the ready editor.
 */

import type {
  EditingState,
  NamespaceGestureState,
  NodePlacementState,
  NoteAttachState,
  SelectionState,
} from "../../state/editorStates";

// State initialization
export function toInitialSelectionState(): SelectionState {
  return { kind: "none" };
}

export function toInitialNodePlacementState(): NodePlacementState {
  return null;
}

export function toInitialEditingState(): EditingState {
  return { kind: "none" };
}

export function toInitialNoteAttachState(): NoteAttachState {
  return { kind: "none" };
}

export function toInitialNamespaceGestureState(): NamespaceGestureState {
  return { kind: "none" };
}
