/**
 * @fileoverview Discriminated union result type for parseDiagram().
 * Separates successful parse from structured error states so call sites
 * can handle each case without relying on sentinel values or exceptions.
 */

import type { DiagramTree, SourceLocation } from "../../models/classDiagram/diagramTreeModel";
import type { ClassId } from "../../models/classDiagram/primitives";

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
      // only malformed, not missing annotations. Shape: classId -> SourceLocation
      readonly malformedAnnotations: ReadonlyMap<ClassId, SourceLocation>;
    };
