/**
 * @fileoverview Translates class and namespace parent namespace changes.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { NamespaceId } from "../../../shared/ids";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  type StatementKind,
  STATEMENT_KINDS,
} from "../anchors/statementAnchors";
import { movedStatementPayload } from "../placement/moveStatementSlice";
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
  sourceText: string
): WriteIntent[] {
  const statement: StatementRef = { kind: "namespace", namespaceId: command.namespaceId };
  return translateParentNamespaceSet(
    statement,
    "namespace",
    command.parentNamespaceId,
    graph,
    provenance,
    sourceText
  );
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
      anchor: anchorAtBlockEnd(graph, provenance, targetBlock, sameKind),
    },
  ];
}

function anchorAtBlockEnd(
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  targetBlock: BlockRef,
  sameKind: StatementKind
): StatementAnchor {
  return (
    asSameKind(anchorAfterKindList(graph, provenance, targetBlock, [sameKind])) ??
    asDifferentKind(anchorAfterKindList(graph, provenance, targetBlock, STATEMENT_KINDS)) ??
    anchorBlockOpening(targetBlock)
  );
}

function toNamespaceBlock(namespaceId: NamespaceId | null): BlockRef {
  return namespaceId === null ? { kind: "diagram" } : { kind: "namespace", namespaceId };
}
