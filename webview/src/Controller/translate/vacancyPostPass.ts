/**
 * @fileoverview Transaction-level namespace vacancy cleanup for Mermaid-valid output.
 */

import type { EditorCommandTransaction } from "../../View/commands";
import type { ClassId, NamespaceId } from "../../shared/ids";
import type { DiagramGraph } from "../model/diagramGraph";
import type { ProvenanceIndex } from "../model/provenanceIndex";
import type { StatementRef, WriteIntent } from "./writeIntent";

export function applyVacancyPostPass(
  intents: readonly WriteIntent[],
  transaction: EditorCommandTransaction,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const deletedNamespaceIds = toDeletedNamespaceIds(transaction, graph);
  const topmostDeletedNamespaceIds = new Set(
    [...deletedNamespaceIds].filter((namespaceId) => {
      const parentNamespaceId = graph.namespaces.get(namespaceId)?.parentNamespaceId ?? null;
      return !parentNamespaceId || !deletedNamespaceIds.has(parentNamespaceId);
    })
  );
  const retainedIntents = intents.filter(
    (intent) =>
      intent.kind !== "deleteStatement" ||
      !isCoveredByDeletedNamespace(intent.target, graph, topmostDeletedNamespaceIds)
  );
  return [
    ...retainedIntents,
    ...[...topmostDeletedNamespaceIds].flatMap((namespaceId) => {
      if (!provenance.namespaces.has(namespaceId)) return [];
      return [
        { kind: "deleteStatement" as const, target: { kind: "namespace" as const, namespaceId } },
      ];
    }),
    ...[...deletedNamespaceIds].flatMap((namespaceId) =>
      provenance.namespaceStyles.has(namespaceId)
        ? [
            {
              kind: "deleteStatement" as const,
              target: { kind: "namespaceStyle" as const, namespaceId },
            },
          ]
        : []
    ),
  ];
}

function isCoveredByDeletedNamespace(
  target: StatementRef,
  graph: DiagramGraph,
  topmostDeletedNamespaceIds: ReadonlySet<NamespaceId>
): boolean {
  switch (target.kind) {
    case "class": {
      const parentNamespaceId = graph.classes.get(target.classId)?.parentNamespaceId ?? null;
      return isNamespaceInDeletedSubtree(parentNamespaceId, graph, topmostDeletedNamespaceIds);
    }
    case "namespace": {
      const parentNamespaceId = graph.namespaces.get(target.namespaceId)?.parentNamespaceId ?? null;
      return isNamespaceInDeletedSubtree(parentNamespaceId, graph, topmostDeletedNamespaceIds);
    }
    default:
      return false;
  }
}

function isNamespaceInDeletedSubtree(
  namespaceId: NamespaceId | null,
  graph: DiagramGraph,
  topmostDeletedNamespaceIds: ReadonlySet<NamespaceId>
): boolean {
  let current = namespaceId;
  while (current) {
    if (topmostDeletedNamespaceIds.has(current)) return true;
    current = graph.namespaces.get(current)?.parentNamespaceId ?? null;
  }
  return false;
}

function toDeletedNamespaceIds(
  transaction: EditorCommandTransaction,
  graph: DiagramGraph
): ReadonlySet<NamespaceId> {
  const classParents = new Map<ClassId, NamespaceId | null>(
    [...graph.classes.values()].map((classNode) => [classNode.id, classNode.parentNamespaceId])
  );
  const namespaceParents = new Map<NamespaceId, NamespaceId | null>(
    [...graph.namespaces.values()].map((namespaceNode) => [
      namespaceNode.id,
      namespaceNode.parentNamespaceId,
    ])
  );

  for (const command of transaction) {
    switch (command.type) {
      case "class.parentNamespace.set":
        classParents.set(command.classId, command.parentNamespaceId);
        break;
      case "namespace.parentNamespace.set":
        namespaceParents.set(command.namespaceId, command.parentNamespaceId);
        break;
    }
  }

  const deleted = new Set<NamespaceId>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const namespaceId of graph.namespaces.keys()) {
      if (deleted.has(namespaceId)) continue;
      if (hasDirectMembers(namespaceId, classParents, namespaceParents, deleted)) continue;
      deleted.add(namespaceId);
      changed = true;
    }
  }
  return deleted;
}

function hasDirectMembers(
  namespaceId: NamespaceId,
  classParents: ReadonlyMap<ClassId, NamespaceId | null>,
  namespaceParents: ReadonlyMap<NamespaceId, NamespaceId | null>,
  deletedNamespaceIds: ReadonlySet<NamespaceId>
): boolean {
  for (const parentNamespaceId of classParents.values()) {
    if (parentNamespaceId === namespaceId) return true;
  }
  for (const [childNamespaceId, parentNamespaceId] of namespaceParents) {
    if (deletedNamespaceIds.has(childNamespaceId)) continue;
    if (parentNamespaceId === namespaceId) return true;
  }
  return false;
}
