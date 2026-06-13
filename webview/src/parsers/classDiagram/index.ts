/**
 * @fileoverview Public API for the Mermaid class diagram parser.
 * Orchestrates the tokenizer and rule functions to produce a DiagramTree
 * from raw Mermaid source. Pure function — no React, no VS Code dependencies.
 */

import type { ClassNode, DiagramTree, SourceLocation } from "../../models/classDiagram/diagramTreeModel";
import type { ClassId } from "../../models/classDiagram/primitives";
import { attachSpatial, buildSpatiallyUnawareDiagramTree, parseSpatialAnnotations } from "./diagramTreeBuilders";
import { tokenize } from "./tokenizer";

/**
 * The result of parsing a Mermaid class diagram source string.
 *
 * ok: true  — source is a valid classDiagram with full @spatial coverage.
 * invalidSyntax — source is not a recognisable classDiagram.
 * missingAnnotations — diagram parsed correctly but one or more classes
 *   lack a valid @spatial annotation. The partial model is included so
 *   callers can run the auto-placement generator without re-parsing.
 *   malformedAnnotations maps classId → source location of an incomplete
 *   @spatial line so Generate can replace it rather than append a duplicate.
 */
export type ParseResult =
  | { readonly ok: true; readonly model: DiagramTree }
  | { readonly ok: false; readonly error: "invalidSyntax"; readonly message: string }
  | {
      readonly ok: false;
      readonly error: "missingAnnotations";
      readonly missingIds: readonly ClassId[];
      readonly model: DiagramTree;
      readonly malformedAnnotations: ReadonlyMap<ClassId, SourceLocation>;
    };

/**
 * Returns true if the source begins with a `classDiagram` declaration,
 * ignoring leading blank lines and comment lines.
 */
function hasClassDiagramHeader(source: string): boolean {
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("%%")) continue;
    return trimmed === "classDiagram" || trimmed.startsWith("classDiagram ");
  }
  return false;
}

/**
 * Parses a Mermaid class diagram source string into a ParseResult.
 * Returns an invalidSyntax error if the source does not begin with
 * `classDiagram`. Returns a missingAnnotations error if any class lacks
 * a @spatial annotation (the partial model is included for auto-placement).
 * Returns ok on full success.
 *
 * @param source - Full .mmd file content.
 * @returns ParseResult discriminated union.
 */
export function parseDiagram(source: string): ParseResult {
  try {
    if (!hasClassDiagramHeader(source)) {
      return {
        ok: false,
        error: "invalidSyntax",
        message: "Source must begin with 'classDiagram'",
      };
    }

    const tokens = tokenize(source);
    const spatiallyUnawareTree = buildSpatiallyUnawareDiagramTree(tokens);
    const { valid, malformed } = parseSpatialAnnotations(tokens);
    const model = attachSpatial(spatiallyUnawareTree, valid);

    const missingIds = [...model.nodes.values()]
      .filter((node): node is ClassNode => node.kind === "class")
      .filter((node) => !node.spatial)
      .map((node) => node.id);
    if (missingIds.length > 0) {
      const malformedAnnotations = new Map(
        malformed.map((entry) => [entry.classId, entry.location])
      );
      return { ok: false, error: "missingAnnotations", missingIds, model, malformedAnnotations };
    }

    return { ok: true, model };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown parse error";
    return { ok: false, error: "invalidSyntax", message };
  }
}
