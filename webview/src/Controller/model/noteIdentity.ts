/**
 * @fileoverview Note source-identity composition shared by Controller components.
 */

import type { NoteId } from "../../shared/ids";

/**
 * Composes a session-scoped note identifier from the note statement's index in
 * document order. No note identity is persisted in Mermaid source.
 */
export function composeNoteId(ordinal: number): NoteId {
  return `note:${ordinal}` as NoteId;
}
