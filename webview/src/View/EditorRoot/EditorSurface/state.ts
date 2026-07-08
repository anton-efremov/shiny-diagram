/**
 * @behavior SelectionState, NodePlacementState, and EditingState construction for the ready editor.
 */

import type {
  EditingState,
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
