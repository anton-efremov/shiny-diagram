/**
 * @fileoverview Placement invariant for writing the first class-block child into a blockless class declaration.
 */

import type { ClassId } from "../../../shared/ids";
import type { ProvenanceIndex, SourceSpan } from "../../model/provenanceIndex";
import type { SourcePosition } from "../../model/sourceEdit";
import type { ValueRef, WriteIntent } from "../writeIntent";

export function insertFirstClassBlockChildIntoBlocklessClass(
  classId: ClassId,
  provenance: ProvenanceIndex,
  sourceText: string,
  childPayload: string
): WriteIntent[] {
  const record = provenance.classes.get(classId);
  if (!record) throw new Error(`Missing provenance for class ${classId}`);
  const target = lastHeaderFieldTarget(classId, provenance);
  const span = spanForTarget(classId, provenance, target);
  const fieldText = sliceSpan(sourceText, span);
  const childIndent = `${lineIndent(sourceText, record.header.start.line)}  `;
  const lines = childPayload.split("\n").map((line) => `${childIndent}${line}`);
  return [
    {
      kind: "replaceValue",
      target,
      payload: `${fieldText} {\n${lines.join("\n")}\n${lineIndent(
        sourceText,
        record.header.start.line
      )}}`,
    },
  ];
}

function lastHeaderFieldTarget(classId: ClassId, provenance: ProvenanceIndex): ValueRef {
  const fields = provenance.classes.get(classId)?.fields;
  if (!fields) throw new Error(`Missing provenance for class ${classId}`);
  if (fields.labelFull) return { kind: "classLabelFull", classId };
  if (fields.genericType) return { kind: "classGenericType", classId };
  return { kind: "className", classId };
}

function spanForTarget(
  classId: ClassId,
  provenance: ProvenanceIndex,
  target: ValueRef
): SourceSpan {
  const fields = provenance.classes.get(classId)?.fields;
  if (!fields) throw new Error(`Missing provenance for class ${classId}`);
  switch (target.kind) {
    case "classLabelFull":
      if (!fields.labelFull) throw new Error(`Missing class label span for ${classId}`);
      return fields.labelFull;
    case "classGenericType":
      if (!fields.genericType) throw new Error(`Missing class generic span for ${classId}`);
      return fields.genericType;
    case "className":
      return fields.declaredName;
    default:
      throw new Error(`Unsupported class block target ${target.kind}`);
  }
}

function sliceSpan(sourceText: string, span: SourceSpan): string {
  return sourceText.slice(
    positionToOffset(sourceText, span.start),
    positionToOffset(sourceText, span.end)
  );
}

function positionToOffset(sourceText: string, position: SourcePosition): number {
  let offset = 0;
  let line = 0;
  while (line < position.line && offset < sourceText.length) {
    const nextLf = sourceText.indexOf("\n", offset);
    if (nextLf === -1) return sourceText.length;
    offset = nextLf + 1;
    line++;
  }
  return offset + position.character;
}

function lineIndent(sourceText: string, lineNumber: number): string {
  return /^\s*/.exec(sourceText.split(/\r?\n/)[lineNumber] ?? "")?.[0] ?? "";
}
