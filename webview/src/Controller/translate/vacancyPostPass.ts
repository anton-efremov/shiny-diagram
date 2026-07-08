/**
 * @fileoverview Transaction-level namespace vacancy cleanup for Mermaid-valid output.
 *
 * The post-pass is overlap-aware by construction: member move/delete workers keep
 * their own statement deletions, and vacancy cleanup deletes only the emptied
 * namespace frame lines plus its style annotation. That avoids re-deleting child
 * statement ranges that a prior intent already owns.
 */

import type { EditorCommandTransaction } from "../../View/commands";
import type { ClassId, NamespaceId } from "../../shared/ids";
import type { DiagramGraph } from "../model/diagramGraph";
import type { ProvenanceIndex } from "../model/provenanceIndex";
import type { SourceSpan } from "../model/sourceEdit";
import type { WriteIntent } from "./writeIntent";

export function applyVacancyPostPass(
  intents: readonly WriteIntent[],
  transaction: EditorCommandTransaction,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string
): WriteIntent[] {
  const deletedNamespaceIds = toDeletedNamespaceIds(transaction, graph);
  return [
    ...intents,
    ...[...deletedNamespaceIds].flatMap((namespaceId) =>
      toNamespaceFrameDeleteIntents(namespaceId, provenance, sourceText)
    ),
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

function toNamespaceFrameDeleteIntents(
  namespaceId: NamespaceId,
  provenance: ProvenanceIndex,
  sourceText: string
): WriteIntent[] {
  const record = provenance.namespaces.get(namespaceId);
  if (!record) return [];
  return [
    { kind: "deleteRange", target: toFullLineSpan(record.header, sourceText) },
    { kind: "deleteRange", target: toFullLineSpan(record.self.end, sourceText) },
  ];
}

function toFullLineSpan(span: SourceSpan | SourceSpan["end"], sourceText: string): SourceSpan {
  const line = "start" in span ? span.start.line : span.line;
  const lineCount = sourceText.split("\n").length;
  const hasFollowingLine = line < lineCount - 1;
  return {
    start: { line, character: 0 },
    end: hasFollowingLine
      ? { line: line + 1, character: 0 }
      : { line, character: sourceText.split("\n")[line]?.length ?? 0 },
  };
}
