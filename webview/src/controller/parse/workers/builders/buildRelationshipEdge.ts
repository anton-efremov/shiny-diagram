/**
 * @fileoverview Builds relationship edges from relationship tokens.
 */

import { toClassId, toRelationshipId } from "../../../../shared/ids";
import type { RelationshipEdge } from "../../../model/diagramTree";
import type { RelationshipType } from "../../../../shared/relationshipTypes";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "../toSourceLocation";

type RelationshipOperator = { readonly syntax: string; readonly type: RelationshipType };

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
): RelationshipEdge | null {
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
    kind: "relationship",
    source: toClassId(source.name),
    target: toClassId(target.name),
    id: toRelationshipId(`${source.name}--${target.name}--${relationshipIndex}`),
    type: operator.type,
    label,
    sourceMultiplicity: source.multiplicity,
    targetMultiplicity: target.multiplicity,
    location: toSourceLocation(token),
  };
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
