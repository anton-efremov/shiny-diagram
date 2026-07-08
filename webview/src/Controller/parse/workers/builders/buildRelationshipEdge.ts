/**
 * @fileoverview Builds relationship facts from relationship tokens.
 */

import { toClassId } from "../../../../shared/ids";
import { IDENTITY_PATTERN, readIdentity } from "../../../model/identitySpelling";
import type { RelationshipEdge } from "../../../model/diagramGraph";
import { composeRelationshipId } from "../../../model/relationshipIdentity";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../../../shared/uml";
import type { SourceSpan } from "../../../model/sourceEdit";
import type { ParseToken } from "../tokenizer";
import { toSourceSpan } from "../toSourceSpan";

type ParsedEndpoint = {
  readonly name: string;
  readonly multiplicity: string | null;
};

type ParsedRelationshipShape = {
  readonly source: ParsedEndpoint;
  readonly target: ParsedEndpoint;
  readonly sourceEndpointKind: RelationshipEndpointKind;
  readonly targetEndpointKind: RelationshipEndpointKind;
  readonly lineKind: RelationshipLineKind;
};

export type ParsedRelationshipResult =
  | {
      readonly kind: "edge";
      readonly edge: RelationshipEdge;
      readonly location: SourceSpan;
    }
  | {
      readonly kind: "lollipopInterface";
      readonly className: string;
      readonly interfaceLabel: string;
      readonly location: SourceSpan;
    };

/**
 * Builds a relationship edge or class-owned lollipop interface from a relationship token.
 */
export function buildRelationshipEdge(
  token: ParseToken,
  relationshipIndex: number
): ParsedRelationshipResult | null {
  if (token.type !== "relationship") return null;

  const raw = token.raw.trim();
  const { declaration, label } = splitLabel(raw);
  const parsed = parseRelationshipDeclaration(declaration);
  if (!parsed) return null;

  const location = toSourceSpan(token);
  if (isCanonicalLollipopInterface(parsed, label)) {
    const sourceIsInterface = parsed.sourceEndpointKind === "lollipop";
    return {
      kind: "lollipopInterface",
      className: sourceIsInterface ? parsed.target.name : parsed.source.name,
      interfaceLabel: sourceIsInterface ? parsed.source.name : parsed.target.name,
      location,
    };
  }

  return {
    kind: "edge",
    location,
    edge: {
      kind: "relationship",
      id: composeRelationshipId(
        toClassId(parsed.source.name),
        toClassId(parsed.target.name),
        relationshipIndex
      ),
      ordinal: relationshipIndex,
      source: {
        classId: toClassId(parsed.source.name),
        multiplicity: parsed.source.multiplicity,
        endpointKind: parsed.sourceEndpointKind,
      },
      target: {
        classId: toClassId(parsed.target.name),
        multiplicity: parsed.target.multiplicity,
        endpointKind: parsed.targetEndpointKind,
      },
      lineKind: parsed.lineKind,
      label: label ?? null,
    },
  };
}

function parseRelationshipDeclaration(declaration: string): ParsedRelationshipShape | null {
  const core = locateLineCore(declaration);
  if (!core) return null;

  const sourcePart = declaration.slice(0, core.start);
  const targetPart = declaration.slice(core.end);
  const sourceMarker = parseStartMarker(sourcePart);
  const targetMarker = parseEndMarker(targetPart);
  const source = parseEndpoint(sourceMarker.endpointText);
  const target = parseEndpoint(targetMarker.endpointText);

  if (!source.name || !target.name) return null;

  return {
    source,
    target,
    sourceEndpointKind: sourceMarker.endpointKind,
    targetEndpointKind: targetMarker.endpointKind,
    lineKind: core.syntax === "--" ? "solid" : "dashed",
  };
}

function locateLineCore(
  declaration: string
): { start: number; end: number; syntax: "--" | ".." } | null {
  let inQuote = false;
  for (let index = 0; index < declaration.length - 1; index++) {
    if (declaration[index] === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (inQuote) continue;

    const syntax = declaration.slice(index, index + 2);
    if (syntax === "--" || syntax === "..") {
      return { start: index, end: index + 2, syntax };
    }
  }
  return null;
}

function parseStartMarker(text: string): {
  readonly endpointText: string;
  readonly endpointKind: RelationshipEndpointKind;
} {
  const marker = matchStartMarker(text);
  if (!marker) return { endpointText: text, endpointKind: "none" };
  return {
    endpointText: text.slice(0, text.length - marker.syntax.length),
    endpointKind: marker.endpointKind,
  };
}

function parseEndMarker(text: string): {
  readonly endpointText: string;
  readonly endpointKind: RelationshipEndpointKind;
} {
  const marker = matchEndMarker(text);
  if (!marker) return { endpointText: text, endpointKind: "none" };
  return {
    endpointText: text.slice(marker.syntax.length),
    endpointKind: marker.endpointKind,
  };
}

function matchStartMarker(
  text: string
): { readonly syntax: string; readonly endpointKind: RelationshipEndpointKind } | null {
  for (const marker of START_MARKERS) {
    if (!text.endsWith(marker.syntax)) continue;
    if (marker.syntax === "o" && !isStartAggregationBoundary(text, marker.syntax.length)) {
      continue;
    }
    return marker;
  }
  return null;
}

function matchEndMarker(
  text: string
): { readonly syntax: string; readonly endpointKind: RelationshipEndpointKind } | null {
  for (const marker of END_MARKERS) {
    if (!text.startsWith(marker.syntax)) continue;
    if (marker.syntax === "o" && !isEndAggregationBoundary(text, marker.syntax.length)) {
      continue;
    }
    return marker;
  }
  return null;
}

const START_MARKERS: readonly {
  readonly syntax: string;
  readonly endpointKind: RelationshipEndpointKind;
}[] = [
  { syntax: "()", endpointKind: "lollipop" },
  { syntax: "<|", endpointKind: "triangle" },
  { syntax: "|>", endpointKind: "triangle" },
  { syntax: "<", endpointKind: "arrow" },
  { syntax: ">", endpointKind: "arrow" },
  { syntax: "*", endpointKind: "composition" },
  { syntax: "o", endpointKind: "aggregation" },
];

const END_MARKERS: readonly {
  readonly syntax: string;
  readonly endpointKind: RelationshipEndpointKind;
}[] = START_MARKERS;

function isStartAggregationBoundary(text: string, markerLength: number): boolean {
  const beforeMarker = text.at(-markerLength - 1);
  return beforeMarker === undefined || /\s|"/.test(beforeMarker);
}

function isEndAggregationBoundary(text: string, markerLength: number): boolean {
  const afterMarker = text.at(markerLength);
  return afterMarker === undefined || /\s|"/.test(afterMarker);
}

function isCanonicalLollipopInterface(
  relationship: ParsedRelationshipShape,
  label: string | undefined
): boolean {
  if (label !== undefined) return false;
  if (relationship.lineKind !== "solid") return false;
  if (relationship.source.multiplicity !== null || relationship.target.multiplicity !== null) {
    return false;
  }
  const sourceLollipop = relationship.sourceEndpointKind === "lollipop";
  const targetLollipop = relationship.targetEndpointKind === "lollipop";
  const sourceNone = relationship.sourceEndpointKind === "none";
  const targetNone = relationship.targetEndpointKind === "none";
  return (sourceLollipop && targetNone) || (targetLollipop && sourceNone);
}

function splitLabel(raw: string): { declaration: string; label?: string } {
  const colon = findRelationshipLabelColon(raw);
  if (colon === -1) return { declaration: raw };
  return { declaration: raw.slice(0, colon).trim(), label: raw.slice(colon + 1).trim() };
}

function parseEndpoint(part: string): ParsedEndpoint {
  const trimmed = part.trim();
  const m1 = new RegExp(`^"([^"]+)"\\s+(${IDENTITY_PATTERN})$`).exec(trimmed);
  if (m1) return { multiplicity: m1[1], name: readIdentity(m1[2]) };
  const m2 = new RegExp(`^(${IDENTITY_PATTERN})\\s+"([^"]+)"$`).exec(trimmed);
  if (m2) return { name: readIdentity(m2[1]), multiplicity: m2[2] };
  return { name: readIdentity(trimmed.replace(/^"([^"]+)"\s*/, "").trim()), multiplicity: null };
}

function findRelationshipLabelColon(raw: string): number {
  let inDoubleQuote = false;
  let inBacktick = false;
  for (let index = 0; index < raw.length; index++) {
    const character = raw[index];
    if (character === '"' && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (character === "`" && !inDoubleQuote) {
      inBacktick = !inBacktick;
      continue;
    }
    if (character === ":" && !inDoubleQuote && !inBacktick) return index;
  }
  return -1;
}
