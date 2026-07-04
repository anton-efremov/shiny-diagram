/**
 * @fileoverview Parses spatial annotations and attaches valid geometry to diagram classes.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex, SpatialRecord } from "../../model/provenanceIndex";
import type { SourceSpan } from "../../model/sourceEdit";
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
      const { location, rawLine, spatial } = entry;
      classes.set(id, { ...node, spatial });
      classSpatial.set(id, toSpatialRecord(location, rawLine));
    }
  }

  return {
    graph: { ...graph, classes },
    provenance: { ...provenance, classSpatial },
  };
}

function toSpatialRecord(location: SourceSpan, rawLine: string): SpatialRecord {
  const targetMatch = /@spatial:([A-Za-z_]\w*)/.exec(rawLine);
  return {
    self: location,
    fields: {
      target: toFieldLocation(
        location,
        targetMatch?.index ?? 0,
        targetMatch?.[0].length ?? 0,
        "@spatial:".length
      ),
      x: toSpatialValueLocation(location, rawLine, "x"),
      y: toSpatialValueLocation(location, rawLine, "y"),
      w: toSpatialValueLocation(location, rawLine, "w"),
      h: toSpatialValueLocation(location, rawLine, "h"),
    },
  };
}

function toSpatialValueLocation(
  location: SourceSpan,
  rawLine: string,
  key: "x" | "y" | "w" | "h"
): SourceSpan {
  const match = new RegExp(`(?:^|\\s)${key}=([^\\s]+)`).exec(rawLine);
  if (!match || match.index === undefined) {
    throw new Error(`Missing spatial coordinate ${key}`);
  }
  const keyStart = rawLine.indexOf(`${key}=`, match.index);
  const start = keyStart + 2;
  return {
    start: { line: location.start.line, character: start },
    end: { line: location.start.line, character: start + match[1].length },
  };
}

function toFieldLocation(
  location: SourceSpan,
  matchStart: number,
  matchLength: number,
  prefixLength: number
): SourceSpan {
  const start = matchStart + prefixLength;
  const end = matchStart + matchLength;
  return {
    start: { line: location.start.line, character: start },
    end: { line: location.start.line, character: end },
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
