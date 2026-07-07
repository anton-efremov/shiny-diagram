/**
 * @fileoverview
 * Statement insertion anchors, exposed as two composable sets of functions:
 *
 * 1. Builders — locate a statement and return a raw `StatementRef | null`: the
 *    sibling to anchor after, or `null` when none exists.
 * 2. Labelers — take a located ref and tag it for the blank-line policy,
 *    yielding a `StatementAnchor | null`: `asSameKind` (no blank line before) and
 *    `asDifferentKind` (blank line before). Only `anchorBlockOpening` skips the split
 *    and returns a finished * `StatementAnchor` directly: the terminal first-child fallback,
 *    genuinely label-free.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourceSpan } from "../../model/sourceEdit";
import type { AttributeId, MethodId, NamespaceId } from "../../../shared/ids";
import type { BlockRef, StatementAnchor, StatementRef } from "../writeIntent";

// ============================================================================
// Vocabulary
// ============================================================================

export type StatementKind = StatementRef["kind"];

/** Every statement kind, e.g. for the "after the latest statement of any kind" fallback tier. */
export const STATEMENT_KINDS: readonly StatementKind[] = [
  "class",
  "namespace",
  "blockMember",
  "shortMember",
  "relationship",
  "lollipopInterface",
  "styleDefinition",
  "classDirectStyle",
  "styleApplication",
  "classSpatial",
  "namespaceSpatial",
  "note",
];

// ============================================================================
// Builders — each answers one question; workers chain them with `??`
// ============================================================================

/**
 * The latest explicit statement of any listed kind inside `container`, or `null`.
 * Union across the list, latest by source order. Returns a raw ref — the caller
 * labels it same- or different-kind.
 */
export function anchorAfterKindList(
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  container: BlockRef,
  statementKinds: readonly StatementKind[]
): StatementRef | null {
  let latest: AnchorCandidate | null = null;

  for (const kind of statementKinds) {
    for (const { ref, location } of anchorCandidatesOfKind(kind, provenance)) {
      if (!sameBlock(blockOf(graph, ref), container)) {
        continue;
      }
      if (latest === null || compareLocations(location, latest.location) > 0) {
        latest = { ref, location };
      }
    }
  }

  return latest?.ref ?? null;
}

/**
 * Locate a specific statement, or `null` when it has no explicit record (an
 * implicit statement is not an anchorable sibling). Returns a raw ref — the
 * caller labels it same- or different-kind.
 */
export function anchorExactStatement(
  provenance: ProvenanceIndex,
  statement: StatementRef
): StatementRef | null {
  return hasStatementRecord(provenance, statement) ? statement : null;
}

/** The terminal fallback: the first-child position under a container's opening. */
export function anchorBlockOpening(scope: BlockRef): StatementAnchor {
  return { kind: "atBlockOpening", block: scope };
}

// ============================================================================
// Labels — tag a located ref with its blank-line policy, or pass `null` through
// ============================================================================

/** Same-kind neighbor → no blank line. Passes `null` through so it composes in a `??` chain. */
export function asSameKind(ref: StatementRef | null): StatementAnchor | null {
  return ref === null ? null : { kind: "afterSameKind", statement: ref };
}

/** Different-kind neighbor → blank line before. Passes `null` through so it composes in a `??` chain. */
export function asDifferentKind(ref: StatementRef | null): StatementAnchor | null {
  return ref === null ? null : { kind: "afterDifferentKind", statement: ref };
}

// ============================================================================
// Internals: block membership — which block is a statement written in
// ============================================================================

function blockOf(graph: DiagramGraph, ref: StatementRef): BlockRef {
  switch (ref.kind) {
    case "class":
      return namespaceBlock(graph.classes.get(ref.classId)?.parentNamespaceId ?? null);
    case "namespace":
      return namespaceBlock(graph.namespaces.get(ref.namespaceId)?.parentNamespaceId ?? null);
    case "blockMember":
      return blockMemberOwningClass(graph, ref.memberId);
    case "shortMember":
      return { kind: "diagram" };
    default:
      // relationship, styleDefinition, classDirectStyle, styleApplication,
      // classSpatial, namespaceSpatial, note: only ever written at diagram level.
      return { kind: "diagram" };
  }
}

function namespaceBlock(namespaceId: NamespaceId | null): BlockRef {
  return namespaceId === null ? { kind: "diagram" } : { kind: "namespace", namespaceId };
}

/** A blockMember is enclosed by its owning class; an orphan falls back to diagram scope. */
function blockMemberOwningClass(graph: DiagramGraph, memberId: AttributeId | MethodId): BlockRef {
  for (const node of graph.classes.values()) {
    const owns =
      node.attributes.some((attribute) => attribute.id === memberId) ||
      node.methods.some((method) => method.id === memberId);
    if (owns) {
      return { kind: "class", classId: node.id };
    }
  }
  return { kind: "diagram" };
}

function sameBlock(left: BlockRef, right: BlockRef): boolean {
  if (left.kind !== right.kind) {
    return false;
  }
  switch (left.kind) {
    case "diagram":
      return true;
    case "class":
      return left.classId === (right as Extract<BlockRef, { kind: "class" }>).classId;
    case "namespace":
      return left.namespaceId === (right as Extract<BlockRef, { kind: "namespace" }>).namespaceId;
  }
}

// ============================================================================
// Internals: candidate enumeration — explicit statements of a kind, with location
// ============================================================================

type AnchorCandidate = { readonly ref: StatementRef; readonly location: SourceSpan };

function anchorCandidatesOfKind(
  kind: StatementKind,
  provenance: ProvenanceIndex
): AnchorCandidate[] {
  switch (kind) {
    case "class":
      return candidatesFrom(provenance.classes, (classId) => ({ kind, classId }));
    case "namespace":
      return candidatesFrom(provenance.namespaces, (namespaceId) => ({ kind, namespaceId }));
    case "blockMember":
      return candidatesFrom(provenance.blockMembers, (memberId) => ({ kind, memberId }));
    case "shortMember":
      return candidatesFrom(provenance.shortMembers, (memberId) => ({ kind, memberId }));
    case "relationship":
      return candidatesFrom(provenance.relationships, (relationshipId) => ({
        kind,
        relationshipId,
      }));
    case "lollipopInterface":
      return candidatesFrom(provenance.lollipopInterfaces, (lollipopInterfaceId) => ({
        kind,
        lollipopInterfaceId,
      }));
    case "styleDefinition":
      return candidatesFrom(provenance.styleDefinitions, (styleDefId) => ({ kind, styleDefId }));
    case "classDirectStyle":
      return candidatesFrom(provenance.classDirectStyles, (classId) => ({ kind, classId }));
    case "styleApplication":
      return candidatesFrom(provenance.styleApplications, (styleApplicationId) => ({
        kind,
        styleApplicationId,
      }));
    case "classSpatial":
      return candidatesFrom(provenance.classSpatial, (classId) => ({ kind, classId }));
    case "namespaceSpatial":
      return candidatesFrom(provenance.namespaceSpatial, (namespaceId) => ({ kind, namespaceId }));
    case "note":
      return candidatesFrom(provenance.notes, (noteId) => ({ kind, noteId }));
  }
}

/** Wraps a provenance map's entries as candidates, pairing each ref with its `self` location. */
function candidatesFrom<Id>(
  records: ReadonlyMap<Id, { readonly self: SourceSpan }>,
  toRef: (id: Id) => StatementRef
): AnchorCandidate[] {
  return [...records.entries()].map(([id, record]) => ({ ref: toRef(id), location: record.self }));
}

// ============================================================================
// Internals: record existence — does this exact statement have a source record
// ============================================================================

function hasStatementRecord(provenance: ProvenanceIndex, statement: StatementRef): boolean {
  switch (statement.kind) {
    case "class":
      return provenance.classes.has(statement.classId);
    case "namespace":
      return provenance.namespaces.has(statement.namespaceId);
    case "blockMember":
      return provenance.blockMembers.has(statement.memberId);
    case "shortMember":
      return provenance.shortMembers.has(statement.memberId);
    case "relationship":
      return provenance.relationships.has(statement.relationshipId);
    case "lollipopInterface":
      return provenance.lollipopInterfaces.has(statement.lollipopInterfaceId);
    case "styleDefinition":
      return provenance.styleDefinitions.has(statement.styleDefId);
    case "classDirectStyle":
      return provenance.classDirectStyles.has(statement.classId);
    case "styleApplication":
      return provenance.styleApplications.has(statement.styleApplicationId);
    case "classSpatial":
      return provenance.classSpatial.has(statement.classId);
    case "namespaceSpatial":
      return provenance.namespaceSpatial.has(statement.namespaceId);
    case "note":
      return provenance.notes.has(statement.noteId);
  }
}

// ============================================================================
// Internals: ordering
// ============================================================================

function compareLocations(left: SourceSpan, right: SourceSpan): number {
  return (
    left.start.line - right.start.line ||
    left.start.character - right.start.character ||
    left.end.line - right.end.line ||
    left.end.character - right.end.character
  );
}
