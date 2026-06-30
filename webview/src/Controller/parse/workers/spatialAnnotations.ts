/**
 * @fileoverview Parses spatial annotations and attaches valid geometry to diagram classes.
 */

import type { DiagramTree } from "../../model/diagramTree";
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
export function attachSpatial(tree: DiagramTree, valid: readonly SpatialEntry[]): DiagramTree {
  const spatialByClassId = new Map(valid.map((entry) => [entry.classId, entry.spatial]));
  const classes = new Map(tree.classes);

  for (const [id, node] of classes) {
    const spatial = spatialByClassId.get(node.id);
    if (spatial) classes.set(id, { ...node, spatial });
  }

  return { ...tree, classes };
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
