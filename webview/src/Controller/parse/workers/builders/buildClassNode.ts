/**
 * @fileoverview Builds class nodes and members from class-declaration tokens.
 */

import type { ClassAttribute, ClassMethod, ClassNode } from "../../../model/diagramGraph";
import type { SourceSpan } from "../../../model/sourceEdit";
import { toAttributeId, toClassId, toMethodId, type ClassId } from "../../../../shared/ids";
import type { Visibility } from "../../../../shared/uml";
import type { ParseToken } from "../tokenizer";
import { toSourceSpan } from "../toSourceSpan";

const VISIBILITY_PREFIXES = new Set<string>(["+", "-", "#", "~"]);

export type ParsedClassNode = {
  readonly node: ClassNode;
  readonly location: SourceSpan;
  readonly memberLocations: ReadonlyMap<ClassAttribute["id"] | ClassMethod["id"], SourceSpan>;
};

/**
 * Builds a class node from a class-declaration token.
 */
export function buildClassNode(token: ParseToken): ParsedClassNode | null {
  if (token.type !== "classDeclaration") return null;

  const match = /^\s*class\s+(\w+)/.exec(token.raw);
  if (!match) return null;

  const id = toClassId(match[1]);
  const { attributes, methods, annotation, memberLocations } = parseClassBody(
    id,
    token.blockTokens ?? []
  );

  return {
    location: toSourceSpan(token),
    memberLocations,
    node: {
      kind: "class",
      id,
      name: id,
      label: id,
      genericType: null,
      annotation,
      parentNamespaceId: null,
      spatial: null,
      attributes,
      methods,
      lollipopInterfaces: [],
      directStyle: null,
      interaction: null,
    },
  };
}

function parseClassBody(
  classId: ClassId,
  blockTokens: readonly ParseToken[]
): {
  attributes: ClassAttribute[];
  methods: ClassMethod[];
  annotation: string | null;
  memberLocations: Map<ClassAttribute["id"] | ClassMethod["id"], SourceSpan>;
} {
  const attributes: ClassAttribute[] = [];
  const methods: ClassMethod[] = [];
  const memberLocations = new Map<ClassAttribute["id"] | ClassMethod["id"], SourceSpan>();
  let annotation: string | null = null;

  for (const token of blockTokens) {
    const trimmed = token.raw.trim();
    if (trimmed === "") continue;

    const stereotypeMatch = /^<<(.+)>>$/.exec(trimmed);
    if (stereotypeMatch) {
      annotation = stereotypeMatch[1].trim();
      continue;
    }

    const member = parseClassMember(classId, token);
    if (member) {
      if (member.kind === "attribute") {
        attributes.push(member.attribute);
        memberLocations.set(member.attribute.id, member.location);
      } else {
        methods.push(member.method);
        memberLocations.set(member.method.id, member.location);
      }
    }
  }

  return { attributes, methods, annotation, memberLocations };
}

function parseClassMember(
  classId: ClassId,
  token: ParseToken
):
  | {
      readonly kind: "attribute";
      readonly attribute: ClassAttribute;
      readonly location: SourceSpan;
    }
  | { readonly kind: "method"; readonly method: ClassMethod; readonly location: SourceSpan }
  | null {
  const trimmed = token.raw.trim();
  const firstCharacter = trimmed.charAt(0);
  const hasExplicitVisibility = VISIBILITY_PREFIXES.has(firstCharacter);
  const visibility = hasExplicitVisibility ? (firstCharacter as Visibility) : "+";
  const declaration = hasExplicitVisibility ? trimmed.slice(1).trim() : trimmed;

  if (declaration === "") return null;

  if (declaration.includes("(")) {
    return parseMethodMember(classId, token, visibility, declaration);
  }

  return parseFieldMember(classId, token, visibility, declaration);
}

function parseFieldMember(
  classId: ClassId,
  token: ParseToken,
  visibility: Visibility,
  declaration: string
): {
  readonly kind: "attribute";
  readonly attribute: ClassAttribute;
  readonly location: SourceSpan;
} {
  const parts = declaration.split(/\s+/);
  const name = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const fieldType = parts.length > 1 ? parts.slice(0, -1).join(" ") : undefined;

  return {
    kind: "attribute",
    location: toSourceSpan(token),
    attribute: {
      id: toAttributeId(`${classId}:${token.lineNumber}`),
      visibility,
      name,
      attributeType: fieldType ?? null,
      isStatic: false,
    },
  };
}

function parseMethodMember(
  classId: ClassId,
  token: ParseToken,
  visibility: Visibility,
  declaration: string
): { readonly kind: "method"; readonly method: ClassMethod; readonly location: SourceSpan } {
  const methodMatch = /^([^\s(]+)\s*\(([^)]*)\)\s*(.*)$/.exec(declaration);

  if (!methodMatch) {
    return {
      kind: "method",
      location: toSourceSpan(token),
      method: {
        id: toMethodId(`${classId}:${token.lineNumber}`),
        visibility,
        name: declaration,
        parameters: "",
        returnType: null,
        isStatic: false,
        isAbstract: false,
      },
    };
  }

  const returnType = methodMatch[3].trim();

  return {
    kind: "method",
    location: toSourceSpan(token),
    method: {
      id: toMethodId(`${classId}:${token.lineNumber}`),
      visibility,
      name: methodMatch[1],
      returnType: returnType.length > 0 ? returnType : null,
      parameters: methodMatch[2],
      isStatic: false,
      isAbstract: false,
    },
  };
}
