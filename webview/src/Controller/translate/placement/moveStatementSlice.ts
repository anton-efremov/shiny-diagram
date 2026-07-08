/**
 * @fileoverview Raw source-slice movement helpers for namespace membership rewrites.
 */

import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { SourcePosition, SourceSpan } from "../../model/sourceEdit";
import type { StatementRef } from "../writeIntent";

const INDENT_UNIT = "  ";

export function movedStatementPayload(
  statement: StatementRef,
  provenance: ProvenanceIndex,
  sourceText: string,
  indentDelta: number
): string {
  const span = statementSpan(statement, provenance);
  const relative = toRelativeBlockIndent(sliceSpan(sourceText, span), sourceText, span.start);
  if (indentDelta === 0) return relative;
  return relative
    .split("\n")
    .map((line) => shiftLine(line, indentDelta))
    .join("\n");
}

export function statementSpan(statement: StatementRef, provenance: ProvenanceIndex): SourceSpan {
  switch (statement.kind) {
    case "class": {
      const record = provenance.classes.get(statement.classId);
      if (!record) throw new Error(`Missing provenance for class ${statement.classId}`);
      return record.self;
    }
    case "namespace": {
      const record = provenance.namespaces.get(statement.namespaceId);
      if (!record) throw new Error(`Missing provenance for namespace ${statement.namespaceId}`);
      return record.self;
    }
    default:
      throw new Error(`Unsupported movable statement ${statement.kind}`);
  }
}

function shiftLine(line: string, indentDelta: number): string {
  if (line === "") return line;
  if (indentDelta > 0) return `${INDENT_UNIT.repeat(indentDelta)}${line}`;
  return removeIndentPrefix(line, INDENT_UNIT.repeat(Math.abs(indentDelta)));
}

function toRelativeBlockIndent(
  text: string,
  sourceText: string,
  startPosition: SourcePosition
): string {
  const lines = text.split("\n");
  const sourceLine = sourceText.split("\n")[startPosition.line] ?? "";
  const baseIndent = sourceLine.slice(0, startPosition.character);
  if (baseIndent === "") return text;
  return lines.map((line) => removeIndentPrefix(line, baseIndent)).join("\n");
}

function removeIndentPrefix(line: string, baseIndent: string): string {
  if (line === "" || !line.startsWith(baseIndent)) return line;
  return line.slice(baseIndent.length);
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
