/**
 * @fileoverview Parses spatial annotations and attaches valid geometry to diagram classes.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex, SourceLocation, SpatialRecord } from "../../model/provenanceIndex";
import {
  buildSpatialData,
  type MalformedAnnotation,
  type SpatialEntry,
} from "./builders/buildSpatialData";
import type { ParseToken } from "./tokenizer";

export type SpatialAnnotationParseResult = {
  readonly valid: SpatialEntry[];
  readonly malformed: MalformedAnnotation[];
};

/**
 * Collects valid and malformed spatial annotations from parser tokens.
 */
export function parseSpatialAnnotations(tokens: ParseToken[]): SpatialAnnotationParseResult {
  const valid: SpatialEntry[] = [];
  const malformed: MalformedAnnotation[] = [];

  traverseSpatialTokens(tokens, valid, malformed);

  return { valid, malformed };
}

/**
 * Attaches parsed spatial data to matching classes.
 */
export function attachSpatial(
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  valid: readonly SpatialEntry[]
): { readonly graph: DiagramGraph; readonly provenance: ProvenanceIndex } {
  const spatialByClassId = new Map(valid.map((entry) => [entry.classId, entry]));
  const classes = new Map(graph.classes);
  const classSpatial = new Map(provenance.classSpatial);

  for (const [id, node] of classes) {
    const entry = spatialByClassId.get(node.id);
    if (entry) {
      classes.set(id, { ...node, spatial: entry.spatial });
      classSpatial.set(id, toSpatialRecord(entry.location));
    }
  }

  return {
    graph: { ...graph, classes },
    provenance: { ...provenance, classSpatial },
  };
}

function toSpatialRecord(location: SourceLocation): SpatialRecord {
  const targetMatch = /@spatial:([A-Za-z_]\w*)/.exec(location.raw);
  return {
    self: location,
    fields: {
      target: toFieldLocation(
        location,
        targetMatch?.index ?? 0,
        targetMatch?.[0].length ?? 0,
        "@spatial:".length
      ),
      x: toSpatialValueLocation(location, "x"),
      y: toSpatialValueLocation(location, "y"),
      w: toSpatialValueLocation(location, "w"),
      h: toSpatialValueLocation(location, "h"),
    },
  };
}

function toSpatialValueLocation(
  location: SourceLocation,
  key: "x" | "y" | "w" | "h"
): SourceLocation {
  const match = new RegExp(`(?:^|\\s)${key}=([^\\s]+)`).exec(location.raw);
  if (!match || match.index === undefined) {
    throw new Error(`Missing spatial coordinate ${key}`);
  }
  const keyStart = location.raw.indexOf(`${key}=`, match.index);
  const start = keyStart + 2;
  return {
    startLine: location.startLine,
    startChar: start,
    endLine: location.startLine,
    endChar: start + match[1].length,
    raw: match[1],
  };
}

function toFieldLocation(
  location: SourceLocation,
  matchStart: number,
  matchLength: number,
  prefixLength: number
): SourceLocation {
  const start = matchStart + prefixLength;
  const end = matchStart + matchLength;
  return {
    startLine: location.startLine,
    startChar: start,
    endLine: location.startLine,
    endChar: end,
    raw: location.raw.slice(start, end),
  };
}

function traverseSpatialTokens(
  tokens: readonly ParseToken[],
  valid: SpatialEntry[],
  malformed: MalformedAnnotation[]
): void {
  for (const token of tokens) {
    if (token.type === "spatialAnnotation") {
      collectSpatialResult(token, valid, malformed);
    }
    if (token.blockTokens) {
      traverseSpatialTokens(token.blockTokens, valid, malformed);
    }
  }
}

function collectSpatialResult(
  token: ParseToken,
  valid: SpatialEntry[],
  malformed: MalformedAnnotation[]
): void {
  const spatial = buildSpatialData(token);
  if (!spatial) return;

  if ("spatial" in spatial) {
    valid.push(spatial);
  } else {
    malformed.push(spatial);
  }
}
