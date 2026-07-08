/**
 * @fileoverview Runs model validation rules over parsed text-block values.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import { validateAnnotation } from "../../model/validation/annotation";
import { validateClassGenericType } from "../../model/validation/className";
import { validateMemberText } from "../../model/validation/memberText";
import type { EditorDiagnostic } from "../parseResult";

export function validateTextBlocks(graph: DiagramGraph): readonly EditorDiagnostic[] {
  const diagnostics: EditorDiagnostic[] = [];

  for (const classNode of graph.classes.values()) {
    diagnostics.push(
      ...toDiagnostics(
        validateClassGenericType(classNode.genericType, classNode.name),
        classNode.id
      )
    );
    diagnostics.push(
      ...toDiagnostics(validateAnnotation(classNode.annotation, classNode.name), classNode.id)
    );

    for (const attribute of classNode.attributes) {
      diagnostics.push(
        ...toDiagnostics(validateMemberText(attribute.text, "field", classNode.name), attribute.id)
      );
    }
    for (const method of classNode.methods) {
      diagnostics.push(
        ...toDiagnostics(validateMemberText(method.text, "method", classNode.name), method.id)
      );
    }
  }

  return diagnostics;
}

function toDiagnostics(
  verdicts: ReturnType<typeof validateMemberText>,
  elementId: string
): EditorDiagnostic[] {
  return verdicts
    .filter((verdict) => !verdict.ok && verdict.message)
    .map((verdict) => ({
      kind: "syntaxError",
      message: verdict.message ?? "Invalid Mermaid syntax",
      elementId,
    }));
}
