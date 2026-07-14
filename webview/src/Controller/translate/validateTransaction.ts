/**
 * @fileoverview Synchronous validation entry for View command transactions.
 */

import type {
  EditorCommand,
  EditorCommandTransaction,
  TransactionError,
} from "../../View/commands";
import type { AttributeId, ClassId, MethodId, NamespaceId } from "../../shared/ids";
import { toNamespaceId } from "../../shared/ids";
import { STYLE_PROPERTIES, type StyleProperties } from "../../shared/style";
import type { MemberClassifier, MemberKind } from "../../shared/uml";
import type { DiagramGraph } from "../model/diagramGraph";
import { spellIdentity } from "../model/identitySpelling";
import { toDisplayMemberText, toSourceGenericTypes, toSourceMemberText } from "../model/memberText";
import { validateAnnotation } from "../model/validation/annotation";
import { validateClassGenericType } from "../model/validation/className";
import { validateMemberText } from "../model/validation/memberText";

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
    case "namespace.create":
      return validateNamespaceCreateCommand(command, graph);
    case "namespace.name.set":
      return validateNamespaceNameSetCommand(command.namespaceId, command.name, graph);
    case "namespace.style.set":
      return validateNamespaceStyleSetCommand(command.namespaceId, command.style, graph);
    case "namespace.delete":
      return graph.namespaces.has(command.namespaceId)
        ? []
        : [`Namespace "${command.namespaceId}" does not exist`];
    case "class.parentNamespace.set":
      return validateClassParentNamespaceSetCommand(
        command.classId,
        command.parentNamespaceId,
        graph
      );
    case "namespace.parentNamespace.set":
      return validateNamespaceParentNamespaceSetCommand(
        command.namespaceId,
        command.parentNamespaceId,
        graph
      );
    default:
      return [];
  }
}

function validateNamespaceNameSetCommand(
  namespaceId: NamespaceId,
  name: string,
  graph: DiagramGraph
): readonly string[] {
  const errors: string[] = [];
  const node = graph.namespaces.get(namespaceId);
  if (!node) errors.push(`Namespace "${namespaceId}" does not exist`);
  const localName = name.trim();
  if (localName === "") errors.push("Namespace name must not be empty");
  if (localName.includes("`")) {
    errors.push(`Namespace name must not contain backticks: ${name}`);
  }
  if (!node || localName === "" || localName.includes("`")) return errors;

  const nextId = toNamespaceId(
    node.parentNamespaceId ? `${node.parentNamespaceId}.${localName}` : localName
  );
  const renamedNamespaceIds = new Set(
    [...graph.namespaces.keys()].filter(
      (candidateId) => candidateId === namespaceId || candidateId.startsWith(`${namespaceId}.`)
    )
  );
  for (const candidateId of renamedNamespaceIds) {
    const renamedId = toNamespaceId(`${nextId}${candidateId.slice(namespaceId.length)}`);
    if (
      renamedId !== candidateId &&
      !renamedNamespaceIds.has(renamedId) &&
      graph.namespaces.has(renamedId)
    ) {
      errors.push(`Namespace "${renamedId}" already exists`);
    }
  }
  return errors;
}

function validateNamespaceStyleSetCommand(
  namespaceId: NamespaceId,
  style: StyleProperties | null,
  graph: DiagramGraph
): readonly string[] {
  const errors: string[] = [];
  if (!graph.namespaces.has(namespaceId)) errors.push(`Namespace "${namespaceId}" does not exist`);
  if (style === null) return errors;

  const known: ReadonlySet<string> = new Set(STYLE_PROPERTIES.map(({ name }) => name));
  for (const property of Object.keys(style)) {
    if (!known.has(property))
      errors.push(`Namespace style property "${property}" is not supported`);
  }
  return errors;
}

function validateClassParentNamespaceSetCommand(
  classId: ClassId,
  parentNamespaceId: NamespaceId | null,
  graph: DiagramGraph
): readonly string[] {
  const errors: string[] = [];
  if (!graph.classes.has(classId)) errors.push(`Class "${classId}" does not exist`);
  if (parentNamespaceId !== null && !graph.namespaces.has(parentNamespaceId)) {
    errors.push(`Namespace "${parentNamespaceId}" does not exist`);
  }
  return errors;
}

function validateNamespaceParentNamespaceSetCommand(
  namespaceId: NamespaceId,
  parentNamespaceId: NamespaceId | null,
  graph: DiagramGraph
): readonly string[] {
  const errors: string[] = [];
  if (!graph.namespaces.has(namespaceId)) errors.push(`Namespace "${namespaceId}" does not exist`);
  if (parentNamespaceId !== null && !graph.namespaces.has(parentNamespaceId)) {
    errors.push(`Namespace "${parentNamespaceId}" does not exist`);
  }
  if (
    parentNamespaceId !== null &&
    isNamespaceDescendantOrSelf(parentNamespaceId, namespaceId, graph)
  ) {
    errors.push(
      `Namespace "${namespaceId}" cannot be moved into itself or its descendant "${parentNamespaceId}"`
    );
  }
  return errors;
}

function isNamespaceDescendantOrSelf(
  candidateId: NamespaceId,
  namespaceId: NamespaceId,
  graph: DiagramGraph
): boolean {
  let current: NamespaceId | null = candidateId;
  while (current) {
    if (current === namespaceId) return true;
    current = graph.namespaces.get(current)?.parentNamespaceId ?? null;
  }
  return false;
}

function validateNamespaceCreateCommand(
  command: Extract<EditorCommand, { readonly type: "namespace.create" }>,
  graph: DiagramGraph
): readonly string[] {
  const errors: string[] = [];
  if (command.initialClassIds.length + command.initialNamespaceIds.length === 0) {
    errors.push("Namespace must contain at least one member");
  }
  for (const classId of command.initialClassIds) {
    const classNode = graph.classes.get(classId);
    if (!classNode) {
      errors.push(`Class "${classId}" does not exist`);
    } else if (classNode.parentNamespaceId !== null) {
      errors.push(
        `Class "${classId}" is already inside namespace "${classNode.parentNamespaceId}"`
      );
    }
  }
  for (const namespaceId of command.initialNamespaceIds) {
    const namespaceNode = graph.namespaces.get(namespaceId);
    if (!namespaceNode) {
      errors.push(`Namespace "${namespaceId}" does not exist`);
    } else if (namespaceNode.parentNamespaceId !== null) {
      errors.push(
        `Namespace "${namespaceId}" is already inside namespace "${namespaceNode.parentNamespaceId}"`
      );
    }
  }
  return errors;
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
  if (text.includes('"')) {
    return [
      `Note text "${text}" would be reinterpreted by Mermaid because double quotes end note strings`,
    ];
  }
  return [];
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
