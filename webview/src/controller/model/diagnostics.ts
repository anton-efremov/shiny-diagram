/**
 * Flag: "syntaxError" is not in the spec's four-kind union but is required
 * to carry the parse error message for invalidSyntax status through diagnostics.
 */
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
