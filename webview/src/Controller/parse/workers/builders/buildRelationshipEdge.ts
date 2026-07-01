/**
 * @fileoverview Builds relationship edges from relationship tokens.
 */

import { toClassId, toRelationshipId } from "../../../../shared/ids";
import type { RelationshipEdge } from "../../../model/diagramGraph";
import type {
  RelationshipEndpointKind,
  RelationshipLineKind,
  RelationshipType,
} from "../../../../shared/uml";
import type { SourceLocation } from "../../../model/sourceLocation";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "../toSourceLocation";

type RelationshipOperator = { readonly syntax: string; readonly type: RelationshipType };

export type ParsedRelationshipEdge = {
  readonly edge: RelationshipEdge;
  readonly location: SourceLocation;
};

const RELATIONSHIP_OPERATORS: readonly RelationshipOperator[] = [
  { syntax: "<|--|>", type: "twoWay" },
  { syntax: "--()", type: "lollipop" },
  { syntax: "()--", type: "lollipop" },
  { syntax: "..|>", type: "realization" },
  { syntax: "<|--", type: "inheritance" },
  { syntax: "-->", type: "association" },
  { syntax: "..>", type: "dependency" },
  { syntax: "*--", type: "composition" },
  { syntax: "o--", type: "aggregation" },
  { syntax: "--", type: "solidLink" },
  { syntax: "..", type: "dashedLink" },
];

/**
 * Builds a relationship edge from a relationship token.
 */
export function buildRelationshipEdge(
  token: ParseToken,
  relationshipIndex: number
): ParsedRelationshipEdge | null {
  if (token.type !== "relationship") return null;

  const raw = token.raw.trim();
  const { declaration, label } = splitLabel(raw);
  const operator = findOperator(declaration);
  if (!operator) return null;

  const [sourcePart, targetPart] = declaration.split(operator.syntax);
  const source = parseEndpoint(sourcePart);
  const target = parseEndpoint(targetPart);

  if (!source.name || !target.name) return null;

  return {
    location: toSourceLocation(token),
    edge: {
      kind: "relationship",
      id: toRelationshipId(`${source.name}--${target.name}--${relationshipIndex}`),
      source: {
        classId: toClassId(source.name),
        multiplicity: source.multiplicity ?? null,
        endpointKind: toRelationshipShape(operator.type).sourceKind,
      },
      target: {
        classId: toClassId(target.name),
        multiplicity: target.multiplicity ?? null,
        endpointKind: toRelationshipShape(operator.type).targetKind,
      },
      lineKind: toRelationshipShape(operator.type).lineKind,
      label: label ?? null,
    },
  };
}

function toRelationshipShape(type: RelationshipType): {
  readonly sourceKind: RelationshipEndpointKind;
  readonly targetKind: RelationshipEndpointKind;
  readonly lineKind: RelationshipLineKind;
} {
  switch (type) {
    case "association":
      return { sourceKind: "none", targetKind: "arrow", lineKind: "solid" };
    case "dependency":
      return { sourceKind: "none", targetKind: "arrow", lineKind: "dashed" };
    case "inheritance":
      return { sourceKind: "triangle", targetKind: "none", lineKind: "solid" };
    case "realization":
      return { sourceKind: "none", targetKind: "triangle", lineKind: "dashed" };
    case "composition":
      return { sourceKind: "composition", targetKind: "none", lineKind: "solid" };
    case "aggregation":
      return { sourceKind: "aggregation", targetKind: "none", lineKind: "solid" };
    case "twoWay":
      return { sourceKind: "triangle", targetKind: "triangle", lineKind: "solid" };
    case "dashedLink":
      return { sourceKind: "none", targetKind: "none", lineKind: "dashed" };
    case "solidLink":
    case "lollipop":
      return { sourceKind: "none", targetKind: "none", lineKind: "solid" };
  }
}

function splitLabel(raw: string): { declaration: string; label?: string } {
  const labelMatch = /^(.*?)\s*:\s*(.+)$/.exec(raw);
  if (!labelMatch) return { declaration: raw };
  return { declaration: labelMatch[1].trim(), label: labelMatch[2].trim() };
}

function findOperator(declaration: string): RelationshipOperator | null {
  return RELATIONSHIP_OPERATORS.find((op) => declaration.includes(op.syntax)) ?? null;
}

function parseEndpoint(part: string): { name: string; multiplicity?: string } {
  const trimmed = part.trim();
  const m1 = /^"([^"]+)"\s+(\w+)$/.exec(trimmed);
  if (m1) return { multiplicity: m1[1], name: m1[2] };
  const m2 = /^(\w+)\s+"([^"]+)"$/.exec(trimmed);
  if (m2) return { name: m2[1], multiplicity: m2[2] };
  return { name: trimmed.replace(/^"([^"]+)"\s*/, "").trim() };
}
