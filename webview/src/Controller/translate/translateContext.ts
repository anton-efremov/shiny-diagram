/**
 * @fileoverview Transaction-scoped translate context: a per-dispatch ledger of
 * state that spans commands within one frozen snapshot. Methods accumulate what
 * the transaction has claimed so far — never another intent's output, keeping the
 * single-snapshot invariant intact. Source-identity allocation is the first such
 * concern; the context also collects the identity deltas the transaction causes
 * and reports them as the `TransactionOutcome` returned to View.
 *
 * Recording rules:
 * - Class IDs are Controller-allocated, so allocation records `created`
 *   automatically as a side effect of the allocator methods.
 * - Relationship IDs are positional, so the relationship translate workers
 *   record renames and creates explicitly through the recorder methods.
 * - No current command renames or creates styles through a Controller-allocated
 *   ID that View consumes, so the `styles` delta stays empty.
 */

import type { ClassId, NoteId, RelationshipId } from "../../shared/ids";
import type { TransactionOutcome } from "../../View/commands";
import type { DiagramGraph } from "../model/diagramGraph";
import { allocateClassId, generateDuplicateClassId } from "./classIdentity";

export type TranslateContext = {
  readonly allocateClassId: (requestedName: string | null) => ClassId;
  readonly allocateDuplicateId: (sourceClassId: ClassId) => ClassId;
  readonly recordClassRenamed: (from: ClassId, to: ClassId) => void;
  readonly recordRelationshipRenamed: (from: RelationshipId, to: RelationshipId) => void;
  readonly recordRelationshipCreated: (id: RelationshipId) => void;
  readonly recordNoteCreated: (id: NoteId) => void;
  /** Relationship creates recorded so far in this transaction, for ordinal math. */
  readonly relationshipCreateCount: () => number;
  /** Note creates recorded so far in this transaction, for ordinal math. */
  readonly noteCreateCount: () => number;
  readonly toTransactionOutcome: () => TransactionOutcome;
};

export function createTranslateContext(graph: DiagramGraph): TranslateContext {
  const reserved = new Set<ClassId>();
  const createdClassIds: ClassId[] = [];
  const renamedRelationships: Array<{
    readonly from: RelationshipId;
    readonly to: RelationshipId;
  }> = [];
  const renamedClassIds: Array<{ readonly from: ClassId; readonly to: ClassId }> = [];
  const createdRelationshipIds: RelationshipId[] = [];
  const createdNoteIds: NoteId[] = [];

  return {
    allocateClassId(requestedName) {
      const id = allocateClassId(requestedName, graph);
      createdClassIds.push(id);
      return id;
    },
    allocateDuplicateId(sourceClassId) {
      const id = generateDuplicateClassId(graph, sourceClassId, reserved);
      reserved.add(id);
      createdClassIds.push(id);
      return id;
    },
    recordClassRenamed(from, to) {
      renamedClassIds.push({ from, to });
    },
    recordRelationshipRenamed(from, to) {
      renamedRelationships.push({ from, to });
    },
    recordRelationshipCreated(id) {
      createdRelationshipIds.push(id);
    },
    recordNoteCreated(id) {
      createdNoteIds.push(id);
    },
    relationshipCreateCount() {
      return createdRelationshipIds.length;
    },
    noteCreateCount() {
      return createdNoteIds.length;
    },
    toTransactionOutcome() {
      return {
        classes: { renamed: renamedClassIds, created: createdClassIds },
        relationships: { renamed: renamedRelationships, created: createdRelationshipIds },
        notes: { renamed: [], created: createdNoteIds },
        styles: { renamed: [], created: [] },
      };
    },
  };
}
