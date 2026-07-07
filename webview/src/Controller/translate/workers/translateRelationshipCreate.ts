/**
 * @fileoverview Translates relationship creation into a Mermaid relationship statement.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import { composeRelationshipId } from "../../model/relationshipIdentity";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { TranslateContext } from "../translateContext";
import type { BlockRef, StatementAnchor, WriteIntent } from "../writeIntent";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../anchors/statementAnchors";
import { composeRelationshipStatement } from "./relationshipSyntax";

export function translateRelationshipCreate(
  command: EditorCommandOf<"relationship.create">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  context: TranslateContext
): WriteIntent[] {
  // The created statement is appended after the last relationship, so its parse
  // ordinal is the count of existing relationships plus the creates already
  // recorded in this transaction. Precondition: a transaction mixing
  // relationship creates with relationship deletes yields unreliable `created`
  // ordinals; no current journey produces that mix.
  context.recordRelationshipCreated(
    composeRelationshipId(
      command.source.classId,
      command.target.classId,
      graph.relationships.size + context.relationshipCreateCount()
    )
  );

  return [
    {
      kind: "insertStatement",
      payload: composeRelationshipStatement({
        sourceClassId: command.source.classId,
        targetClassId: command.target.classId,
        sourceEndpointKind: command.source.endpointKind,
        targetEndpointKind: command.target.endpointKind,
        lineKind: command.lineKind,
        sourceMultiplicity: command.source.multiplicity,
        targetMultiplicity: command.target.multiplicity,
        label: command.label,
      }),
      anchor: toRelationshipAnchor(graph, provenance),
    },
  ];
}

function toRelationshipAnchor(graph: DiagramGraph, provenance: ProvenanceIndex): StatementAnchor {
  const diagramScope: BlockRef = { kind: "diagram" };
  return (
    asSameKind(anchorAfterKindList(graph, provenance, diagramScope, ["relationship"])) ??
    asDifferentKind(
      anchorAfterKindList(
        graph,
        provenance,
        diagramScope,
        STATEMENT_KINDS.filter((kind) => kind !== "classSpatial" && kind !== "namespaceSpatial")
      )
    ) ??
    anchorBlockOpening(diagramScope)
  );
}
