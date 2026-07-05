/**
 * @fileoverview Coordinates tokenization, model construction, and parse status classification.
 */

import type { ParseResult } from "./parseResult";
import { buildSpatiallyUnawareDiagramGraph } from "./workers/buildDiagramGraph";
import { attachSpatial, parseSpatialAnnotations } from "./workers/spatialAnnotations";
import { tokenize } from "./workers/tokenizer";

/**
 * Parses Mermaid class-diagram source into a Controller model and parse status.
 */
export function parseDiagram(source: string): ParseResult {
  try {
    if (!hasClassDiagramHeader(source)) {
      return {
        status: "invalidSyntax",
        diagnostics: [{ kind: "syntaxError", message: "Source must begin with 'classDiagram'" }],
      };
    }

    const tokens = tokenize(source);
    const spatiallyUnaware = buildSpatiallyUnawareDiagramGraph(tokens);
    const { valid, malformed } = parseSpatialAnnotations(tokens);
    const { graph, provenance } = attachSpatial(
      spatiallyUnaware.graph,
      spatiallyUnaware.provenance,
      valid
    );

    const missingIds = [...graph.classes.values()]
      .filter((node) => !node.spatial)
      .map((node) => node.id);

    if (missingIds.length > 0) {
      const malformedAnnotations = new Map(
        malformed.map((entry) => [entry.classId, entry.location])
      );
      return {
        status: "missingAnnotations",
        graph,
        provenance,
        diagnostics: [],
        missingIds,
        malformedAnnotations,
      };
    }

    return { status: "ready", graph, provenance, diagnostics: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown parse error";
    return { status: "invalidSyntax", diagnostics: [{ kind: "syntaxError", message }] };
  }
}

function hasClassDiagramHeader(source: string): boolean {
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("%%")) continue;
    return trimmed === "classDiagram" || trimmed.startsWith("classDiagram ");
  }
  return false;
}
