/**
 * @fileoverview Statement-bound note annotation + statement pair operations.
 *
 * Co-located insertStatement intents are concatenated in intent order by
 * resolve, so annotation then note at the same anchor preserves adjacency.
 */

import type { SpatialAttachment } from "../../../shared/geometry";
import type { NoteId } from "../../../shared/ids";
import type { NoteStatementPayload } from "../syntax/noteSyntax";
import { composeNoteAnnotation, composeNoteStatement } from "../syntax/noteSyntax";
import type { StatementAnchor, WriteIntent } from "../writeIntent";

export function insertNotePair(
  payload: NoteStatementPayload,
  spatial: SpatialAttachment,
  anchor: StatementAnchor
): WriteIntent[] {
  return [
    {
      kind: "insertStatement",
      payload: composeNoteAnnotation(spatial),
      anchor,
    },
    {
      kind: "insertStatement",
      payload: composeNoteStatement(payload),
      anchor,
    },
  ];
}

export function deleteNotePair(noteId: NoteId, hasAnnotation: boolean): WriteIntent[] {
  const noteDelete: WriteIntent = { kind: "deleteStatement", target: { kind: "note", noteId } };
  if (!hasAnnotation) return [noteDelete];
  return [{ kind: "deleteStatement", target: { kind: "noteAnnotation", noteId } }, noteDelete];
}
