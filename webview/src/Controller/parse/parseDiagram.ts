/**
 * @fileoverview Coordinates tokenization, model construction, and parse status classification.
 */

import type { ParseResult } from "./parseResult";
import type { EditorDiagnostic } from "./parseResult";
import type { DiagramGraph } from "../model/diagramGraph";
import { toNamespaceId, type ClassId } from "../../shared/ids";
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
    const syntaxDiagnostics = [
      ...collectUnrecognizedDiagnostics(tokens),
      ...collectInvalidClassBodyDiagnostics(tokens),
      ...collectEmptyNamespaceDiagnostics(tokens),
    ];
    if (syntaxDiagnostics.length > 0) {
      return { status: "invalidSyntax", diagnostics: syntaxDiagnostics };
    }

    const spatiallyUnaware = buildSpatiallyUnawareDiagramGraph(tokens);
    const { valid, malformed } = parseSpatialAnnotations(tokens);
    const namespaceSpatialDiagnostics = collectNamespaceSpatialDiagnostics(
      spatiallyUnaware.graph,
      valid
    );
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
        diagnostics: [
          ...spatiallyUnaware.diagnostics,
          ...noteDiagnostics,
          ...namespaceSpatialDiagnostics,
        ],
        missingIds,
        malformedAnnotations,
      };
    }

    return {
      status: "ready",
      graph,
      provenance,
      diagnostics: [
        ...spatiallyUnaware.diagnostics,
        ...noteDiagnostics,
        ...namespaceSpatialDiagnostics,
      ],
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown parse error";
    return { status: "invalidSyntax", diagnostics: [{ kind: "syntaxError", message }] };
  }
}

function collectInvalidClassBodyDiagnostics(tokens: readonly ParseToken[]): EditorDiagnostic[] {
  const diagnostics: EditorDiagnostic[] = [];
  collectInvalidClassBodyDiagnosticsInto(tokens, diagnostics);
  return diagnostics;
}

function collectInvalidClassBodyDiagnosticsInto(
  tokens: readonly ParseToken[],
  diagnostics: EditorDiagnostic[]
): void {
  for (const token of tokens) {
    if (token.type === "classDeclaration") {
      for (const bodyToken of token.blockTokens ?? []) {
        if (isInvalidClassBodyStatement(bodyToken)) {
          diagnostics.push({
            kind: "syntaxError",
            message: `Invalid statement inside class block at line ${
              bodyToken.lineNumber + 1
            }: ${bodyToken.raw.trim()}`,
          });
        }
      }
      continue;
    }

    if (token.blockTokens) {
      collectInvalidClassBodyDiagnosticsInto(token.blockTokens, diagnostics);
    }
  }
}

function isInvalidClassBodyStatement(token: ParseToken): boolean {
  switch (token.type) {
    case "diagramHeader":
    case "classDeclaration":
    case "relationship":
    case "styleDef":
    case "classDirectStyle":
    case "styleApplication":
    case "spatialAnnotation":
    case "noteAnnotation":
    case "namespaceStyleAnnotation":
    case "noteStatement":
    case "namespace":
    case "knownIgnored":
      return true;
    case "classMember":
    case "directive":
    case "blank":
    case "unrecognized":
      return false;
  }
}

function collectEmptyNamespaceDiagnostics(tokens: readonly ParseToken[]): EditorDiagnostic[] {
  const diagnostics: EditorDiagnostic[] = [];
  collectEmptyNamespaceDiagnosticsInto(tokens, diagnostics);
  return diagnostics;
}

function collectEmptyNamespaceDiagnosticsInto(
  tokens: readonly ParseToken[],
  diagnostics: EditorDiagnostic[]
): void {
  for (const token of tokens) {
    if (token.type === "namespace" && (token.blockTokens?.length ?? 0) === 0) {
      diagnostics.push({
        kind: "syntaxError",
        message: `Empty namespace block at line ${token.lineNumber + 1} is not valid Mermaid`,
      });
    }
    if (token.blockTokens) {
      collectEmptyNamespaceDiagnosticsInto(token.blockTokens, diagnostics);
    }
  }
}

function collectNamespaceSpatialDiagnostics(
  graph: DiagramGraph,
  spatialEntries: readonly {
    readonly classId: ClassId;
    readonly location: { readonly start: { readonly line: number } };
  }[]
): EditorDiagnostic[] {
  return spatialEntries.flatMap((entry) =>
    graph.namespaces.has(toNamespaceId(entry.classId)) && !graph.classes.has(entry.classId)
      ? [
          {
            kind: "orphanedAnnotation" as const,
            elementId: entry.classId,
            message: `Orphaned namespace @spatial annotation at line ${entry.location.start.line + 1}`,
          },
        ]
      : []
  );
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
