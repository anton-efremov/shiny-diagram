/**
 * @fileoverview
 * Statement insertion anchor providers.
 *
 * One rule, applied uniformly:
 * - `blockOf` is the single source of truth for which block a statement is
 *   written in. Only classes and namespaces nest (by `parentNamespaceId`), and
 *   only members live inside a class; every other statement is diagram-level,
 *   because a Mermaid namespace body accepts nothing but class declarations.
 * - `ProvenanceIndex` decides explicit source existence and source order: a
 *   statement is a candidate only if it has a record, and the latest record wins.
 *
 * Thin providers intentionally return either raw refs or one anchor shape. The
 * workers own fallback ordering with `??`, including the same-vs-different kind
 * distinction that later controls blank-line insertion.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex, SourceLocation } from "../../model/provenanceIndex";
import type { AttributeId, MethodId, NamespaceId } from "../../../shared/ids";
import type { BlockRef, StatementAnchor, StatementRef } from "../writeIntent";

export type StatementKind = StatementRef["kind"];

type AnchorCandidate = { readonly ref: StatementRef; readonly location: SourceLocation };

export const STATEMENT_KINDS: readonly StatementKind[] = [
  "class",
  "namespace",
  "member",
  "relationship",
  "styleDefinition",
  "classDirectStyle",
  "styleApplication",
  "classSpatial",
  "namespaceSpatial",
  "note",
];

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

export function anchorExactStatement(
  provenance: ProvenanceIndex,
  statement: StatementRef
): StatementAnchor | null {
  return hasStatementRecord(provenance, statement) ? { kind: "afterSameKind", statement } : null;
}

export function anchorBlockOpening(scope: BlockRef): StatementAnchor {
  return { kind: "atBlockOpening", block: scope };
}

export function asSameKind(ref: StatementRef | null): StatementAnchor | null {
  return ref === null ? null : { kind: "afterSameKind", statement: ref };
}

export function asDifferentKind(ref: StatementRef | null): StatementAnchor | null {
  return ref === null ? null : { kind: "afterDifferentKind", statement: ref };
}

function hasStatementRecord(provenance: ProvenanceIndex, statement: StatementRef): boolean {
  switch (statement.kind) {
    case "class":
      return provenance.classes.has(statement.classId);
    case "namespace":
      return provenance.namespaces.has(statement.namespaceId);
    case "member":
      return provenance.members.has(statement.memberId);
    case "relationship":
      return provenance.relationships.has(statement.relationshipId);
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
// Membership — the one rule: which block is a statement written in
// ============================================================================

function blockOf(graph: DiagramGraph, ref: StatementRef): BlockRef {
  switch (ref.kind) {
    case "class":
      return namespaceBlock(graph.classes.get(ref.classId)?.parentNamespaceId ?? null);
    case "namespace":
      return namespaceBlock(graph.namespaces.get(ref.namespaceId)?.parentNamespaceId ?? null);
    case "member":
      return memberBlock(graph, ref.memberId);
    default:
      // relationship, styleDefinition, classDirectStyle, styleApplication,
      // classSpatial, namespaceSpatial, note: only ever written at diagram level.
      return { kind: "diagram" };
  }
}

function namespaceBlock(namespaceId: NamespaceId | null): BlockRef {
  return namespaceId === null ? { kind: "diagram" } : { kind: "namespace", namespaceId };
}

/** A member's block is its owning class; an orphan member matches no class container. */
function memberBlock(graph: DiagramGraph, memberId: AttributeId | MethodId): BlockRef {
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
// Enumeration — explicit statements of a kind, tagged with their `self` location
// ============================================================================

function anchorCandidatesOfKind(
  kind: StatementKind,
  provenance: ProvenanceIndex
): AnchorCandidate[] {
  switch (kind) {
    case "class":
      return candidatesFrom(provenance.classes, (classId) => ({ kind, classId }));
    case "namespace":
      return candidatesFrom(provenance.namespaces, (namespaceId) => ({ kind, namespaceId }));
    case "member":
      return candidatesFrom(provenance.members, (memberId) => ({ kind, memberId }));
    case "relationship":
      return candidatesFrom(provenance.relationships, (relationshipId) => ({
        kind,
        relationshipId,
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
  records: ReadonlyMap<Id, { readonly self: SourceLocation }>,
  toRef: (id: Id) => StatementRef
): AnchorCandidate[] {
  return [...records.entries()].map(([id, record]) => ({ ref: toRef(id), location: record.self }));
}

// ============================================================================
// Ordering
// ============================================================================

function compareLocations(left: SourceLocation, right: SourceLocation): number {
  return (
    left.startLine - right.startLine ||
    left.startChar - right.startChar ||
    left.endLine - right.endLine ||
    left.endChar - right.endChar
  );
}
