/**
 * @fileoverview Result and diagnostic contracts returned by the parse component.
 */

import type { DiagramTree } from "../model/diagramTree";
import type { SourceLocation } from "../model/sourceLocation";
import type { ClassId } from "../../shared/ids";

export type EditorDiagnostic = {
  readonly kind:
    | "orphanedAnnotation"
    | "duplicateAnnotation"
    | "missingAnnotation"
    | "malformedAnnotation"
    | "syntaxError";
  readonly message: string;
  readonly elementId?: string;
};

/**
 * Missing-annotation results carry generation metadata so commands can add or
 * replace spatial annotations without reparsing source.
 */
export type ParseResult =
  | {
      readonly status: "ready";
      readonly model: DiagramTree;
      readonly diagnostics: readonly EditorDiagnostic[];
    }
  | {
      readonly status: "missingAnnotations";
      readonly model: DiagramTree;
      readonly diagnostics: readonly EditorDiagnostic[];
      readonly missingIds: readonly ClassId[];
      readonly malformedAnnotations: ReadonlyMap<ClassId, SourceLocation>;
    }
  | { readonly status: "invalidSyntax"; readonly diagnostics: readonly EditorDiagnostic[] };
