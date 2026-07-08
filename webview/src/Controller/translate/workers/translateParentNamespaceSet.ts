/**
 * @fileoverview Translates class and namespace parent namespace changes.
 */

import type { EditorCommandOf } from "../../../View/commands";
import { toNamespaceId, type NamespaceId } from "../../../shared/ids";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import { spellNamespaceIdentity } from "../../model/identitySpelling";
import {
  anchorAfterKindListExcluding,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  type StatementKind,
  STATEMENT_KINDS,
} from "../anchors/statementAnchors";
import { toNamespaceRenamePairs } from "../namespaceRenameCascade";
import type { NamespaceRenamePair } from "../namespaceRenameCascade";
import { movedStatementPayload } from "../placement/moveStatementSlice";
import type { TranslateContext } from "../translateContext";
import type { BlockRef, StatementAnchor, StatementRef, WriteIntent } from "../writeIntent";

export function translateClassParentNamespaceSet(
  command: EditorCommandOf<"class.parentNamespace.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string
): WriteIntent[] {
  const statement: StatementRef = { kind: "class", classId: command.classId };
  return translateParentNamespaceSet(
    statement,
    "class",
    command.parentNamespaceId,
    graph,
    provenance,
    sourceText
  );
}

export function translateNamespaceParentNamespaceSet(
  command: EditorCommandOf<"namespace.parentNamespace.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string,
  context: TranslateContext
): WriteIntent[] {
  const statement: StatementRef = { kind: "namespace", namespaceId: command.namespaceId };
  const renamed = toNamespaceReparentRenamePairs(command, graph);
  for (const pair of renamed) {
    context.recordNamespaceRenamed(pair.from, pair.to);
  }
  return [
    ...translateParentNamespaceSet(
      statement,
      "namespace",
      command.parentNamespaceId,
      graph,
      provenance,
      sourceText
    ),
    ...renamed.flatMap((pair) => toNamespaceStyleTargetRenameIntent(pair, provenance)),
  ];
}

function toNamespaceReparentRenamePairs(
  command: EditorCommandOf<"namespace.parentNamespace.set">,
  graph: DiagramGraph
): readonly NamespaceRenamePair[] {
  const current = graph.namespaces.get(command.namespaceId);
  if (!current) return [];
  const nextSegment = command.namespaceId.slice(command.namespaceId.lastIndexOf(".") + 1);
  const nextId = toNamespaceId(
    command.parentNamespaceId ? `${command.parentNamespaceId}.${nextSegment}` : nextSegment
  );
  return toNamespaceRenamePairs(command.namespaceId, nextId, graph);
}

function translateParentNamespaceSet(
  statement: StatementRef,
  sameKind: StatementKind,
  targetNamespaceId: NamespaceId | null,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string
): WriteIntent[] {
  const targetBlock = toNamespaceBlock(targetNamespaceId);
  return [
    { kind: "deleteStatement", target: statement },
    {
      kind: "insertStatement",
      payload: movedStatementPayload(statement, provenance, sourceText, 0),
      anchor: anchorAtBlockEnd(
        graph,
        provenance,
        targetBlock,
        sameKind,
        statement.kind === "namespace"
          ? toOldAncestorNamespaceStatements(statement.namespaceId, graph)
          : []
      ),
    },
  ];
}

function anchorAtBlockEnd(
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  targetBlock: BlockRef,
  sameKind: StatementKind,
  excludedStatements: readonly StatementRef[]
): StatementAnchor {
  return (
    asSameKind(
      anchorAfterKindListExcluding(graph, provenance, targetBlock, [sameKind], excludedStatements)
    ) ??
    asDifferentKind(
      anchorAfterKindListExcluding(
        graph,
        provenance,
        targetBlock,
        STATEMENT_KINDS,
        excludedStatements
      )
    ) ??
    anchorBlockOpening(targetBlock)
  );
}

function toNamespaceBlock(namespaceId: NamespaceId | null): BlockRef {
  return namespaceId === null ? { kind: "diagram" } : { kind: "namespace", namespaceId };
}

function toOldAncestorNamespaceStatements(
  namespaceId: NamespaceId,
  graph: DiagramGraph
): readonly StatementRef[] {
  const statements: StatementRef[] = [];
  let current = graph.namespaces.get(namespaceId)?.parentNamespaceId ?? null;
  while (current) {
    statements.push({ kind: "namespace", namespaceId: current });
    current = graph.namespaces.get(current)?.parentNamespaceId ?? null;
  }
  return statements;
}

function toNamespaceStyleTargetRenameIntent(
  pair: NamespaceRenamePair,
  provenance: ProvenanceIndex
): WriteIntent[] {
  return provenance.namespaceStyles.has(pair.from)
    ? [
        {
          kind: "replaceValue",
          target: { kind: "namespaceStyleTarget", namespaceId: pair.from },
          payload: spellNamespaceIdentity(pair.to),
        },
      ]
    : [];
}
