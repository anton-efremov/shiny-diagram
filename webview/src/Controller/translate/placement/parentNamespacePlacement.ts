import type { NamespaceId } from "../../../shared/ids";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import {
  anchorAfterKindListExcluding,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  type StatementKind,
  STATEMENT_KINDS,
} from "../anchors/statementAnchors";
import type { BlockRef, StatementAnchor, StatementRef, WriteIntent } from "../writeIntent";
import { movedStatementPayload } from "./moveStatementSlice";

export function moveStatementToParentNamespace(
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
