/**
 * @fileoverview Runs model validation rules over parsed text-block values.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import { validateAnnotation } from "../../model/validation/annotation";
import { validateClassGenericType } from "../../model/validation/className";
import { validateMemberText } from "../../model/validation/memberText";
import type { EditorDiagnostic } from "../parseResult";

export function validateTextBlocks(
  graph: DiagramGraph,
  source: string
): readonly EditorDiagnostic[] {
  const diagnostics: EditorDiagnostic[] = [];

  for (const classNode of graph.classes.values()) {
    diagnostics.push(
      ...toDiagnostics(
        validateClassGenericType(classNode.genericType, classNode.name),
        classNode.id,
        source
      )
    );
    diagnostics.push(
      ...toDiagnostics(
        validateAnnotation(classNode.annotation, classNode.name),
        classNode.id,
        source
      )
    );

    for (const attribute of classNode.attributes) {
      diagnostics.push(
        ...toDiagnostics(
          validateMemberText(attribute.text, "field", classNode.name),
          attribute.id,
          source
        )
      );
    }
    for (const method of classNode.methods) {
      diagnostics.push(
        ...toDiagnostics(
          validateMemberText(method.text, "method", classNode.name),
          method.id,
          source
        )
      );
    }
  }

  return diagnostics;
}

function toDiagnostics(
  verdicts: ReturnType<typeof validateMemberText>,
  elementId: string,
  source: string
): EditorDiagnostic[] {
  const sourceLocation = findElementSource(source, elementId);
  return verdicts
    .filter((verdict) => !verdict.ok && verdict.message)
    .map((verdict) => ({
      kind: "syntaxError",
      message: verdict.message ?? "Invalid Mermaid syntax",
      elementId,
      line: sourceLocation.line,
      fragment: sourceLocation.fragment,
    }));
}

function findElementSource(
  source: string,
  elementId: string
): { readonly line: number; readonly fragment: string } {
  const lines = source.split("\n");
  const index = lines.findIndex((line) => line.includes(elementId));
  const sourceIndex = index === -1 ? 0 : index;
  return { line: sourceIndex + 1, fragment: lines[sourceIndex]?.trim() ?? elementId };
}
