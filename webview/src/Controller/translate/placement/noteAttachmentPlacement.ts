/** @fileoverview Locates the existing note position for attachment rewrites. */
import type { NoteId } from "../../../shared/ids";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceSpan } from "../../model/sourceEdit";
import {
  anchorBlockOpening,
  anchorAfterExactStatement,
  asSameKind,
  type StatementKind,
} from "../anchors/statementAnchors";
import type { StatementAnchor, StatementRef } from "../writeIntent";

export function noteReplacementAnchor(
  noteId: NoteId,
  provenance: ProvenanceIndex,
  rewrittenNotes: ReadonlySet<NoteId> = new Set()
): StatementAnchor {
  const annotationAnchor = asSameKind(
    anchorAfterExactStatement(provenance, { kind: "noteAnnotation", noteId })
  );
  if (annotationAnchor) return annotationAnchor;

  const noteRecord = provenance.notes.get(noteId);
  if (!noteRecord) throw new Error(`Missing provenance for note ${noteId}`);
  const previous = findPreviousStatement(provenance, noteRecord.self, rewrittenNotes);
  return previous
    ? { kind: "afterSameKind", statement: previous }
    : anchorBlockOpening({ kind: "diagram" });
}

function findPreviousStatement(
  provenance: ProvenanceIndex,
  before: SourceSpan,
  rewrittenNotes: ReadonlySet<NoteId>
): StatementRef | null {
  const candidates: Array<{ readonly ref: StatementRef; readonly span: SourceSpan }> = [
    ...entries(provenance.classes, "class", "classId"),
    ...entries(provenance.namespaces, "namespace", "namespaceId"),
    ...entries(provenance.shortMembers, "shortMember", "memberId"),
    ...entries(provenance.relationships, "relationship", "relationshipId"),
    ...entries(provenance.lollipopInterfaces, "lollipopInterface", "lollipopInterfaceId"),
    ...entries(provenance.styleDefinitions, "styleDefinition", "styleDefId"),
    ...entries(provenance.classDirectStyles, "classDirectStyle", "classId"),
    ...entries(provenance.styleApplications, "styleApplication", "styleApplicationId"),
    ...entries(provenance.classSpatial, "classSpatial", "classId"),
    ...entries(provenance.noteAnnotations, "noteAnnotation", "noteId"),
    ...entries(provenance.notes, "note", "noteId"),
  ].filter(
    (candidate) =>
      compareSpans(candidate.span, before) < 0 &&
      !(candidate.ref.kind === "note" && rewrittenNotes.has(candidate.ref.noteId))
  );

  candidates.sort((left, right) => compareSpans(right.span, left.span));
  return candidates[0]?.ref ?? null;
}

function entries<Id, Key extends string>(
  records: ReadonlyMap<Id, { readonly self: SourceSpan }>,
  kind: StatementKind,
  key: Key
): Array<{ readonly ref: StatementRef; readonly span: SourceSpan }> {
  return [...records.entries()].map(([id, record]) => ({
    ref: { kind, [key]: id } as unknown as StatementRef,
    span: record.self,
  }));
}

function compareSpans(left: SourceSpan, right: SourceSpan): number {
  return (
    left.start.line - right.start.line ||
    left.start.character - right.start.character ||
    left.end.line - right.end.line ||
    left.end.character - right.end.character
  );
}
