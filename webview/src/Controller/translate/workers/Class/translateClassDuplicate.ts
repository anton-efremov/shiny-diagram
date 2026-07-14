/**
 * @fileoverview Translates `class.duplicate`.
 *
 * Emits the duplicate as three logical statement insertions. The style insertion
 * is omitted when the source class has no explicit style representation.
 *
 * 1. Class declaration block (incl. members)
 * - Written after the source class statement.
 *
 * 2. Spatial annotation
 * - Written after the source class spatial annotation.
 *
 * 3. Style annotation, preserving the source representation
 *
 *   a. Direct style statement of the source in case the source class has direct style
 *     - Written after the direct style statement of the source class.
 *
 *   b. Style application statement of source's style in case the source class has a style application
 *     - Written after the style application statement of the source class.
 *
 *   c. No statement if the source class has no style.
 */

import type { ClassNode, DiagramGraph, StyleApplicationEdge } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import type { SourcePosition, SourceSpan } from "../../../model/sourceEdit";
import type { EditorCommandOf } from "../../../../View/commands";
import type { ClassId, StyleDefId } from "../../../../shared/ids";
import type { StylePropertyName } from "../../../../shared/style";
import type { TranslateContext } from "../../translateContext";
import type { StatementAnchor, StatementRef, WriteIntent } from "../../writeIntent";
import { anchorExactStatement, asSameKind } from "../../anchors/statementAnchors";
import { composeSpatialAnnotation } from "../../syntax/spatialSyntax";
import { composeStyleEntry } from "../../syntax/styleSyntax";
import { spellIdentity } from "../../../model/identitySpelling";

export function translateClassDuplicate(
  command: EditorCommandOf<"class.duplicate">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string,
  context: TranslateContext
): WriteIntent[] {
  const source = graph.classes.get(command.sourceClassId);
  if (!source) throw new Error(`Class ${command.sourceClassId} cannot be duplicated`);
  if (!source.spatial) throw new Error(`Class ${command.sourceClassId} has no spatial data`);

  const id = context.allocateDuplicateId(command.sourceClassId);

  // ---
  // Class declaration
  // ---
  const insertClassIntent: WriteIntent = {
    kind: "insertStatement",
    payload: composeDuplicatedClassDeclaration(provenance, sourceText, command.sourceClassId, id),
    anchor: requireExactAnchor(provenance, { kind: "class", classId: command.sourceClassId }),
  };

  // ---
  // Spatial annotation
  // ---
  const insertSpatialIntent: WriteIntent = {
    kind: "insertStatement",
    payload: composeSpatialAnnotation(id, {
      position: command.position,
      size: source.spatial.size,
    }),
    anchor: requireExactAnchor(provenance, {
      kind: "classSpatial",
      classId: command.sourceClassId,
    }),
  };

  const insertStyleIntent: WriteIntent | null = (() => {
    // ---
    // Direct style
    // ---
    if (source.directStyle) {
      return {
        kind: "insertStatement",
        payload: composeClassDirectStyle(id, source.directStyle),
        anchor: requireExactAnchor(provenance, {
          kind: "classDirectStyle",
          classId: command.sourceClassId,
        }),
      };
    }

    // ---
    // Style application
    // ---
    const sourceStyleApplication = findSourceStyleApplication(graph, command.sourceClassId);
    if (sourceStyleApplication) {
      return {
        kind: "insertStatement",
        payload: composeClassStyleApplication(id, sourceStyleApplication.styleDefId),
        anchor: requireExactAnchor(provenance, {
          kind: "styleApplication",
          styleApplicationId: sourceStyleApplication.id,
        }),
      };
    }

    // ---
    // No style
    // ---
    return null;
  })();

  return [
    insertClassIntent,
    insertSpatialIntent,
    ...(insertStyleIntent ? [insertStyleIntent] : []),
  ];
}

function requireExactAnchor(provenance: ProvenanceIndex, statement: StatementRef): StatementAnchor {
  const ref = anchorExactStatement(provenance, statement);
  if (ref === null) {
    throw new Error(`Missing provenance for ${statement.kind} duplicate anchor`);
  }
  const anchor = asSameKind(ref);
  if (anchor === null) {
    throw new Error(`Missing provenance for ${statement.kind} duplicate anchor`);
  }
  return anchor;
}

function findSourceStyleApplication(
  graph: DiagramGraph,
  classId: ClassId
): StyleApplicationEdge | null {
  return (
    [...graph.styleApplications.values()].find(
      (styleApplication) => styleApplication.targetId === classId
    ) ?? null
  );
}

function composeDuplicatedClassDeclaration(
  provenance: ProvenanceIndex,
  sourceText: string,
  sourceClassId: ClassId,
  classId: ClassId
): string {
  const record = provenance.classes.get(sourceClassId);
  if (!record) throw new Error(`Missing provenance for class ${sourceClassId}`);

  const blockText = sliceSpan(sourceText, record.self);
  const renamedText = replaceSpanWithinText(
    blockText,
    sourceText,
    record.self,
    record.fields.declaredName,
    spellIdentity(classId)
  );
  return toRelativeBlockIndent(renamedText);
}

function replaceSpanWithinText(
  text: string,
  sourceText: string,
  baseSpan: SourceSpan,
  targetSpan: SourceSpan,
  replacement: string
): string {
  const baseOffset = positionToOffset(sourceText, baseSpan.start);
  const startOffset = positionToOffset(sourceText, targetSpan.start) - baseOffset;
  const endOffset = positionToOffset(sourceText, targetSpan.end) - baseOffset;
  return `${text.slice(0, startOffset)}${replacement}${text.slice(endOffset)}`;
}

/** Multi-line insertStatement payloads are relative-indented before resolve adds anchor indent. */
function toRelativeBlockIndent(text: string): string {
  const lines = text.split("\n");
  const baseIndent = /^\s*/.exec(lines[0])?.[0] ?? "";
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

function composeClassDirectStyle(
  classId: ClassId,
  directStyle: NonNullable<ClassNode["directStyle"]>
): string {
  const entries = Object.entries(directStyle).flatMap(([property, value]) =>
    value == null ? [] : [composeStyleEntry(property as StylePropertyName, value)]
  );

  return `style ${spellIdentity(classId)} ${entries.join(",")}`;
}

function composeClassStyleApplication(classId: ClassId, styleDefId: StyleDefId): string {
  return `class ${spellIdentity(classId)}:::${styleDefId}`;
}
