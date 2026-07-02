/**
 * @fileoverview Parses spatial annotations and attaches valid geometry to diagram classes.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndexOld";
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
      classSpatial.set(id, entry.location);
    }
  }

  return {
    graph: { ...graph, classes },
    provenance: { ...provenance, classSpatial },
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
