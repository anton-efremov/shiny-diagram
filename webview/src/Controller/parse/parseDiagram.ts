/**
 * @fileoverview Coordinates tokenization, model construction, and parse status classification.
 */

import type { ParseResult } from "./parseResult";
import type { EditorDiagnostic } from "./parseResult";
import { buildSpatiallyUnawareDiagramGraph } from "./workers/buildDiagramGraph";
import { attachNoteAnnotations } from "./workers/noteAnnotations";
import { attachSpatial, parseSpatialAnnotations } from "./workers/spatialAnnotations";
import { tokenize, type ParseToken } from "./workers/tokenizer";
import { validateTextBlocks } from "./workers/validateTextBlocks";

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
    const unrecognizedDiagnostics = collectUnrecognizedDiagnostics(tokens);
    if (unrecognizedDiagnostics.length > 0) {
      return { status: "invalidSyntax", diagnostics: unrecognizedDiagnostics };
    }

    const spatiallyUnaware = buildSpatiallyUnawareDiagramGraph(tokens);
    const { valid, malformed } = parseSpatialAnnotations(tokens);
    const spatiallyAware = attachSpatial(
      spatiallyUnaware.graph,
      spatiallyUnaware.provenance,
      valid
    );
    const {
      graph,
      provenance,
      diagnostics: noteDiagnostics,
    } = attachNoteAnnotations(spatiallyAware.graph, spatiallyAware.provenance, tokens);
    const validationDiagnostics = validateTextBlocks(graph);
    if (validationDiagnostics.length > 0) {
      return { status: "invalidSyntax", diagnostics: validationDiagnostics };
    }

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
        diagnostics: noteDiagnostics,
        missingIds,
        malformedAnnotations,
      };
    }

    return { status: "ready", graph, provenance, diagnostics: noteDiagnostics };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown parse error";
    return { status: "invalidSyntax", diagnostics: [{ kind: "syntaxError", message }] };
  }
}

function collectUnrecognizedDiagnostics(tokens: readonly ParseToken[]): EditorDiagnostic[] {
  const diagnostics: EditorDiagnostic[] = [];
  collectUnrecognizedDiagnosticsInto(tokens, diagnostics);
  return diagnostics;
}

function collectUnrecognizedDiagnosticsInto(
  tokens: readonly ParseToken[],
  diagnostics: EditorDiagnostic[]
): void {
  for (const token of tokens) {
    if (token.type === "unrecognized") {
      diagnostics.push({
        kind: "syntaxError",
        message: `Unrecognized statement at line ${token.lineNumber + 1}: ${token.raw.trim()}`,
      });
    }
    if (token.blockTokens && token.type !== "classDeclaration") {
      collectUnrecognizedDiagnosticsInto(token.blockTokens, diagnostics);
    }
  }
}

function hasClassDiagramHeader(source: string): boolean {
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("%%")) continue;
    return (
      trimmed === "classDiagram" ||
      trimmed === "classDiagram-v2" ||
      trimmed.startsWith("classDiagram ")
    );
  }
  return false;
}
