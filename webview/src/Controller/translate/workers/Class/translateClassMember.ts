/**
 * @fileoverview Translates opaque class member edit commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { AttributeId, MethodId } from "../../../../shared/ids";
import type { MemberKind } from "../../../../shared/uml";
import type { ClassNode, DiagramGraph } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import type { SourcePosition, SourceSpan } from "../../../model/sourceEdit";
import { toSourceMemberText } from "../../../model/memberText";
import {
  anchorBlockOpening,
  anchorExactStatement,
  asSameKind,
} from "../../anchors/statementAnchors";
import { insertFirstClassBlockChildIntoBlocklessClass } from "../../placement/classBlockEnsure";
import type { StatementAnchor, StatementRef, WriteIntent } from "../../writeIntent";

export function translateClassAttributeSet(
  command: EditorCommandOf<"class.attribute.set">
): WriteIntent[] {
  return [
    {
      kind: "replaceValue",
      target: { kind: "memberName", memberId: command.attributeId },
      payload: toSourceMemberText({ text: command.text, classifier: command.classifier }, "field"),
    },
  ];
}

export function translateClassMethodSet(
  command: EditorCommandOf<"class.method.set">
): WriteIntent[] {
  return [
    {
      kind: "replaceValue",
      target: { kind: "memberName", memberId: command.methodId },
      payload: toSourceMemberText({ text: command.text, classifier: command.classifier }, "method"),
    },
  ];
}

export function translateClassAttributeDelete(
  command: EditorCommandOf<"class.attribute.delete">,
  provenance: ProvenanceIndex
): WriteIntent[] {
  return [deleteMemberIntent(command.attributeId, provenance)];
}

export function translateClassMethodDelete(
  command: EditorCommandOf<"class.method.delete">,
  provenance: ProvenanceIndex
): WriteIntent[] {
  return [deleteMemberIntent(command.methodId, provenance)];
}

export function translateClassAttributeCreate(
  command: EditorCommandOf<"class.attribute.create">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string
): WriteIntent[] {
  const payload = toSourceMemberText(
    { text: command.text, classifier: command.classifier },
    "field"
  );
  if (command.beforeAttributeId === null && isBlocklessClass(command.classId, provenance)) {
    return insertFirstClassBlockChildIntoBlocklessClass(
      command.classId,
      provenance,
      sourceText,
      payload
    );
  }
  return [
    {
      kind: "insertStatement",
      payload,
      anchor: memberCreateAnchor(
        graph,
        provenance,
        graph.classes.get(command.classId),
        "field",
        command.beforeAttributeId
      ),
    },
  ];
}

export function translateClassMethodCreate(
  command: EditorCommandOf<"class.method.create">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string
): WriteIntent[] {
  const payload = toSourceMemberText(
    { text: command.text, classifier: command.classifier },
    "method"
  );
  if (command.beforeMethodId === null && isBlocklessClass(command.classId, provenance)) {
    return insertFirstClassBlockChildIntoBlocklessClass(
      command.classId,
      provenance,
      sourceText,
      payload
    );
  }
  return [
    {
      kind: "insertStatement",
      payload,
      anchor: memberCreateAnchor(
        graph,
        provenance,
        graph.classes.get(command.classId),
        "method",
        command.beforeMethodId
      ),
    },
  ];
}

export function translateClassAttributeMove(
  command: EditorCommandOf<"class.attribute.move">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string
): WriteIntent[] {
  const classNode = graph.classes.get(command.classId);
  return [
    deleteMemberIntent(command.attributeId, provenance),
    {
      kind: "insertStatement",
      payload: readMemberSource(command.attributeId, provenance, sourceText),
      anchor: memberCreateAnchor(graph, provenance, classNode, "field", command.beforeAttributeId),
    },
  ];
}

export function translateClassMethodMove(
  command: EditorCommandOf<"class.method.move">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string
): WriteIntent[] {
  const classNode = graph.classes.get(command.classId);
  return [
    deleteMemberIntent(command.methodId, provenance),
    {
      kind: "insertStatement",
      payload: readMemberSource(command.methodId, provenance, sourceText),
      anchor: memberCreateAnchor(graph, provenance, classNode, "method", command.beforeMethodId),
    },
  ];
}

function deleteMemberIntent(
  memberId: AttributeId | MethodId,
  provenance: ProvenanceIndex
): WriteIntent {
  return {
    kind: "deleteStatement",
    target: provenance.blockMembers.has(memberId)
      ? { kind: "blockMember", memberId }
      : { kind: "shortMember", memberId },
  };
}

function isBlocklessClass(classId: ClassNode["id"], provenance: ProvenanceIndex): boolean {
  return provenance.classes.get(classId)?.body === null;
}

function memberCreateAnchor(
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  classNode: ClassNode | undefined,
  kind: MemberKind,
  beforeMemberId: AttributeId | MethodId | null
): StatementAnchor {
  if (!classNode) throw new Error("Cannot insert member into missing class");

  const classRecord = provenance.classes.get(classNode.id);
  if (!classRecord?.body) {
    throw new Error(`Cannot insert member into blockless class ${classNode.id}`);
  }

  const orderedMembers = kind === "field" ? classNode.attributes : classNode.methods;
  const beforeIndex =
    beforeMemberId === null
      ? orderedMembers.length
      : orderedMembers.findIndex((member) => member.id === beforeMemberId);
  const previous = beforeIndex > 0 ? orderedMembers[beforeIndex - 1] : null;
  if (previous) {
    return requireSameKindAnchor(provenance, {
      kind: provenance.blockMembers.has(previous.id) ? "blockMember" : "shortMember",
      memberId: previous.id,
    });
  }

  return anchorBlockOpening({ kind: "class", classId: classNode.id });
}

function requireSameKindAnchor(
  provenance: ProvenanceIndex,
  statement: StatementRef
): StatementAnchor {
  const anchor = asSameKind(anchorExactStatement(provenance, statement));
  if (!anchor) throw new Error(`Missing provenance for member anchor ${statement.kind}`);
  return anchor;
}

function readMemberSource(
  memberId: AttributeId | MethodId,
  provenance: ProvenanceIndex,
  sourceText: string
): string {
  const record = provenance.blockMembers.get(memberId) ?? provenance.shortMembers.get(memberId);
  if (!record) throw new Error(`Missing provenance for member ${memberId}`);
  return sliceSpan(sourceText, record.fields.text);
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
