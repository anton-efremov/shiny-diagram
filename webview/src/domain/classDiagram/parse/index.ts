import type { DiagramTree, SourceLocation } from "../model/diagramTreeModel";
import type { ClassId } from "../model/primitives";
import type { EditorDiagnostic } from "../model/diagnostics";
import {
  attachSpatial,
  buildSpatiallyUnawareDiagramTree,
  parseSpatialAnnotations,
  synthesizeImplicitClassNodes,
} from "./diagramTreeBuilders";
import { tokenize } from "./tokenizer";

/**
 * Flag: `missingIds` and `malformedAnnotations` on the missingAnnotations variant
 * are not in the sprint2-architecture.md spec, but are needed to preserve the
 * Generate behavior (which needs the missing IDs for layout and the malformed map
 * to replace partial annotations rather than appending duplicates).
 */
export type ParseResult =
  | { readonly status: "ready"; readonly model: DiagramTree; readonly diagnostics: readonly EditorDiagnostic[] }
  | {
      readonly status: "missingAnnotations";
      readonly model: DiagramTree;
      readonly diagnostics: readonly EditorDiagnostic[];
      readonly missingIds: readonly ClassId[];
      readonly malformedAnnotations: ReadonlyMap<ClassId, SourceLocation>;
    }
  | { readonly status: "invalidSyntax"; readonly diagnostics: readonly EditorDiagnostic[] };

function hasClassDiagramHeader(source: string): boolean {
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("%%")) continue;
    return trimmed === "classDiagram" || trimmed.startsWith("classDiagram ");
  }
  return false;
}

export function parseDiagram(source: string): ParseResult {
  try {
    if (!hasClassDiagramHeader(source)) {
      return {
        status: "invalidSyntax",
        diagnostics: [{ kind: "syntaxError", message: "Source must begin with 'classDiagram'" }],
      };
    }

    const tokens = tokenize(source);
    const spatiallyUnawareTree = buildSpatiallyUnawareDiagramTree(tokens);
    const treeWithImplicitClasses = synthesizeImplicitClassNodes(spatiallyUnawareTree);
    const { valid, malformed } = parseSpatialAnnotations(tokens);
    const model = attachSpatial(treeWithImplicitClasses, valid);

    const missingIds = [...model.classes.values()]
      .filter((node) => !node.spatial)
      .map((node) => node.id);

    if (missingIds.length > 0) {
      const malformedAnnotations = new Map(malformed.map((entry) => [entry.classId, entry.location]));
      return { status: "missingAnnotations", model, diagnostics: [], missingIds, malformedAnnotations };
    }

    return { status: "ready", model, diagnostics: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown parse error";
    return { status: "invalidSyntax", diagnostics: [{ kind: "syntaxError", message }] };
  }
}
