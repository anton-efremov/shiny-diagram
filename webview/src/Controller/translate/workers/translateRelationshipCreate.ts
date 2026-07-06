/**
 * @fileoverview Translates relationship creation into a Mermaid relationship statement.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type {
  RelationshipEndpoint,
  RelationshipEndpointKind,
  RelationshipLineKind,
} from "../../../shared/uml";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { BlockRef, StatementAnchor, WriteIntent } from "../writeIntent";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../anchors/statementAnchors";

export function translateRelationshipCreate(
  command: EditorCommandOf<"relationship.create">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  return [
    {
      kind: "insertStatement",
      payload: composeRelationship(command),
      anchor: toRelationshipAnchor(graph, provenance),
    },
  ];
}

function composeRelationship(command: EditorCommandOf<"relationship.create">): string {
  const sourceMultiplicity = composeMultiplicity(command.source.multiplicity);
  const targetMultiplicity = composeMultiplicity(command.target.multiplicity);
  const label = command.label === null ? "" : ` : ${command.label}`;
  return `${command.source.classId}${sourceMultiplicity} ${composeSourceMarker(
    command.source.endpointKind
  )}${composeLine(command.lineKind)}${composeTargetMarker(
    command.target.endpointKind
  )}${targetMultiplicity} ${command.target.classId}${label}`;
}

function composeMultiplicity(multiplicity: RelationshipEndpoint["multiplicity"]): string {
  return multiplicity === null ? "" : ` "${multiplicity}"`;
}

function composeSourceMarker(endpointKind: RelationshipEndpointKind): string {
  switch (endpointKind) {
    case "none":
      return "";
    case "triangle":
      return "<|";
    case "arrow":
      return "<";
    case "composition":
      return "*";
    case "aggregation":
      return "o";
    case "lollipop":
      return "()";
  }
}

function composeTargetMarker(endpointKind: RelationshipEndpointKind): string {
  switch (endpointKind) {
    case "none":
      return "";
    case "triangle":
      return "|>";
    case "arrow":
      return ">";
    case "composition":
      return "*";
    case "aggregation":
      return "o";
    case "lollipop":
      return "()";
  }
}

function composeLine(lineKind: RelationshipLineKind): string {
  switch (lineKind) {
    case "solid":
      return "--";
    case "dashed":
      return "..";
  }
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
