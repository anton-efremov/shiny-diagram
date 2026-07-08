/**
 * @fileoverview Mermaid relationship statement syntax composition for translate workers.
 */

import type { ClassId } from "../../../shared/ids";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../../shared/uml";
import { spellIdentity } from "../../model/identitySpelling";

export type RelationshipStatementShape = {
  readonly sourceClassId: ClassId;
  readonly targetClassId: ClassId;
  readonly sourceEndpointKind: RelationshipEndpointKind;
  readonly targetEndpointKind: RelationshipEndpointKind;
  readonly lineKind: RelationshipLineKind;
  readonly sourceMultiplicity: string | null;
  readonly targetMultiplicity: string | null;
  readonly label: string | null;
};

export function composeRelationshipStatement(shape: RelationshipStatementShape): string {
  const sourceMultiplicity = composeMultiplicity(shape.sourceMultiplicity);
  const targetMultiplicity = composeMultiplicity(shape.targetMultiplicity);
  const label = shape.label === null ? "" : ` : ${shape.label}`;
  return `${spellIdentity(shape.sourceClassId)}${sourceMultiplicity} ${composeRelationshipOperator(
    shape
  )}${targetMultiplicity} ${spellIdentity(shape.targetClassId)}${label}`;
}

export function composeRelationshipOperator(
  shape: Pick<RelationshipStatementShape, "sourceEndpointKind" | "targetEndpointKind" | "lineKind">
): string {
  return `${composeSourceMarker(shape.sourceEndpointKind)}${composeLine(
    shape.lineKind
  )}${composeTargetMarker(shape.targetEndpointKind)}`;
}

function composeMultiplicity(multiplicity: string | null): string {
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
