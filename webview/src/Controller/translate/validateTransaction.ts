/**
 * @fileoverview Synchronous validation entry for View command transactions.
 */

import type {
  EditorCommand,
  EditorCommandTransaction,
  TransactionError,
} from "../../View/commands";
import type { AttributeId, ClassId, MethodId } from "../../shared/ids";
import type { MemberClassifier, MemberKind } from "../../shared/uml";
import type { DiagramGraph } from "../model/diagramGraph";
import { spellIdentity } from "../model/identitySpelling";
import { toDisplayMemberText, toSourceGenericTypes, toSourceMemberText } from "../model/memberText";
import { validateAnnotation } from "../model/validation/annotation";
import { validateClassGenericType } from "../model/validation/className";
import { validateMemberText } from "../model/validation/memberText";
import { escapeNoteText, unescapeNoteText } from "./syntax/noteSyntax";

export function validateTransaction(
  transaction: EditorCommandTransaction,
  graph: DiagramGraph
): readonly TransactionError[] {
  return transaction.flatMap((command, commandIndex) =>
    validateCommand(command, graph).map((message) => ({ message, commandIndex }))
  );
}

function validateCommand(command: EditorCommand, graph: DiagramGraph): readonly string[] {
  switch (command.type) {
    case "class.attribute.create":
      return validateMemberCommand(
        command.text,
        command.classifier,
        "field",
        graph,
        command.classId
      );
    case "class.attribute.set": {
      const owner = findClassOwningMember(graph, command.attributeId);
      return validateMemberCommand(command.text, command.classifier, "field", graph, owner);
    }
    case "class.method.create":
      return validateMemberCommand(
        command.text,
        command.classifier,
        "method",
        graph,
        command.classId
      );
    case "class.method.set": {
      const owner = findClassOwningMember(graph, command.methodId);
      return validateMemberCommand(command.text, command.classifier, "method", graph, owner);
    }
    case "class.name.set":
      return validateClassNameCommand(command.classId, command.name, graph);
    case "class.annotation.set":
      return validateAnnotationCommand(command.classId, command.annotation, graph);
    case "class.label.set":
      return command.label === ""
        ? [`Class "${command.classId}" label must use null to clear`]
        : [];
    case "note.create":
      return [
        ...validateNoteText(command.text),
        ...validateNoteAttachmentTarget(command.attachedToClassId, graph),
      ];
    case "note.text.set":
      return validateNoteText(command.text);
    case "note.attachment.set":
      return validateNoteAttachmentTarget(command.attachedToClassId, graph);
    default:
      return [];
  }
}

function validateMemberCommand(
  text: string,
  classifier: MemberClassifier | null,
  kind: MemberKind,
  graph: DiagramGraph,
  ownerClassId: ClassId | null
): readonly string[] {
  const ownerName = ownerClassId ?? "unknown";
  const structuralErrors =
    kind === "field" && /\(.*\)/.test(text)
      ? [
          `Attribute member in class "${ownerName}" must not contain a method parameter list: ${text}`,
        ]
      : kind === "method" && !/\(.*\)/.test(text)
        ? [`Method member in class "${ownerName}" must contain a method parameter list: ${text}`]
        : [];

  const ruleErrors = validateMemberText(text, kind, ownerName).flatMap((verdict) =>
    verdict.ok || verdict.message === null ? [] : [verdict.message]
  );

  const source = toSourceMemberText({ text, classifier }, kind);
  const roundTrip = toDisplayMemberText(source, kind);
  const roundTripErrors =
    roundTrip.text === text && roundTrip.classifier === classifier
      ? []
      : [
          `Member in class "${ownerName}" would be reinterpreted as "${roundTrip.text}" with classifier ${roundTrip.classifier ?? "none"}`,
        ];

  return [...structuralErrors, ...ruleErrors, ...roundTripErrors];
}

function validateClassNameCommand(
  classId: ClassId,
  displayName: string,
  graph: DiagramGraph
): readonly string[] {
  const parsed = parseDisplayClassName(displayName);
  if (parsed.identity.trim() === "") return ["Class name must not be empty"];
  if (parsed.identity.includes("`"))
    return [`Class name must not contain backticks: ${displayName}`];

  const collision =
    parsed.identity !== classId && graph.classes.has(parsed.identity as ClassId)
      ? [`Class "${parsed.identity}" already exists`]
      : [];

  const genericErrors = validateClassGenericType(parsed.genericType, parsed.identity).flatMap(
    (verdict) => (verdict.ok || verdict.message === null ? [] : [verdict.message])
  );
  const sourceName = `${spellIdentity(parsed.identity)}${
    parsed.genericType ? toSourceGenericTypes(`<${parsed.genericType}>`) : ""
  }`;
  const reparsed = parseDisplayClassName(toDisplayClassNameSourceSpelling(sourceName));
  const roundTripErrors =
    reparsed.identity === parsed.identity && reparsed.genericType === parsed.genericType
      ? []
      : [
          `Class name "${displayName}" would be reinterpreted as "${formatDisplayClassName(
            reparsed
          )}"`,
        ];

  return [...collision, ...genericErrors, ...roundTripErrors];
}

function validateAnnotationCommand(
  classId: ClassId,
  annotation: string | null,
  graph: DiagramGraph
): readonly string[] {
  if (annotation === "") return [`Class "${classId}" annotation must use null to clear`];
  const className = graph.classes.get(classId)?.name ?? classId;
  return validateAnnotation(annotation, className).flatMap((verdict) =>
    verdict.ok || verdict.message === null ? [] : [verdict.message]
  );
}

function validateNoteText(text: string): readonly string[] {
  if (text === "") return ["Note text must not be empty"];
  const roundTrip = unescapeNoteText(escapeNoteText(text));
  return roundTrip === text ? [] : [`Note text would be reinterpreted as "${roundTrip}"`];
}

function validateNoteAttachmentTarget(
  classId: ClassId | null,
  graph: DiagramGraph
): readonly string[] {
  return classId !== null && !graph.classes.has(classId)
    ? [`Class "${classId}" does not exist`]
    : [];
}

function findClassOwningMember(
  graph: DiagramGraph,
  memberId: AttributeId | MethodId
): ClassId | null {
  for (const node of graph.classes.values()) {
    if (
      node.attributes.some((attribute) => attribute.id === memberId) ||
      node.methods.some((method) => method.id === memberId)
    ) {
      return node.id;
    }
  }
  return null;
}

type ParsedClassName = {
  readonly identity: string;
  readonly genericType: string | null;
};

function parseDisplayClassName(displayName: string): ParsedClassName {
  const trimmed = displayName.trim();
  const genericStart = trimmed.indexOf("<");
  if (genericStart === -1 || !trimmed.endsWith(">")) {
    return { identity: trimmed, genericType: null };
  }
  return {
    identity: trimmed.slice(0, genericStart).trim(),
    genericType: trimmed.slice(genericStart + 1, -1),
  };
}

function toDisplayClassNameSourceSpelling(sourceName: string): string {
  return sourceName.replaceAll("~", (match, offset, value) => {
    const tildeIndex = value.slice(0, offset).split("~").length - 1;
    return tildeIndex % 2 === 0 ? "<" : ">";
  });
}

function formatDisplayClassName(parsed: ParsedClassName): string {
  return `${parsed.identity}${parsed.genericType ? `<${parsed.genericType}>` : ""}`;
}
