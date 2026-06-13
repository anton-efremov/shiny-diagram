/**
 * @fileoverview Extracts class relationship declarations from tokenized Mermaid source.
 */

import type { Relationship, RelationshipType } from "../diagramTreeModel";
import type { TokenizedLine } from "../tokenizer";

type RelationshipOperator = {
  readonly syntax: string;
  readonly type: RelationshipType;
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
 * Extracts relationship edges from the tokenized source.
 *
 * @param lines - Flat tokenized line sequence from the tokenizer.
 * @returns Parsed relationship declarations.
 */
export function parseRelationships(lines: TokenizedLine[]): Relationship[] {
  const relationships: Relationship[] = [];

  for (const line of lines) {
    if (line.type !== "relationship") continue;

    const relationship = parseRelationshipLine(line);
    if (relationship) {
      relationships.push(relationship);
    }
  }

  return relationships;
}

function parseRelationshipLine(line: TokenizedLine): Relationship | null {
  const raw = line.raw.trim();
  const { declaration, label } = splitLabel(raw);
  const operator = findOperator(declaration);
  if (!operator) return null;

  const [sourcePart, targetPart] = declaration.split(operator.syntax);
  const source = parseEndpoint(sourcePart);
  const target = parseEndpoint(targetPart);

  if (!source.name || !target.name) return null;

  return {
    source: source.name,
    target: target.name,
    type: operator.type,
    label,
    sourceMultiplicity: source.multiplicity,
    targetMultiplicity: target.multiplicity,
    location: { line: line.lineNumber, raw: line.raw },
  };
}

function splitLabel(raw: string): { declaration: string; label?: string } {
  const labelMatch = /^(.*?)\s*:\s*(.+)$/.exec(raw);
  if (!labelMatch) {
    return { declaration: raw };
  }

  return {
    declaration: labelMatch[1].trim(),
    label: labelMatch[2].trim(),
  };
}

function findOperator(declaration: string): RelationshipOperator | null {
  return RELATIONSHIP_OPERATORS.find((operator) => declaration.includes(operator.syntax)) ?? null;
}

function parseEndpoint(part: string): { name: string; multiplicity?: string } {
  const trimmed = part.trim();
  const multiplicityMatch = /^"([^"]+)"\s+(\w+)$/.exec(trimmed);
  if (multiplicityMatch) {
    return { multiplicity: multiplicityMatch[1], name: multiplicityMatch[2] };
  }

  const reverseMultiplicityMatch = /^(\w+)\s+"([^"]+)"$/.exec(trimmed);
  if (reverseMultiplicityMatch) {
    return { name: reverseMultiplicityMatch[1], multiplicity: reverseMultiplicityMatch[2] };
  }

  return { name: trimmed.replace(/^"([^"]+)"\s*/, "").trim() };
}
