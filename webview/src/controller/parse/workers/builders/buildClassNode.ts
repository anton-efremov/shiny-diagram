/**
 * @fileoverview Builds class nodes and members from class-declaration tokens.
 */

import type {
  ClassAnnotation,
  ClassField,
  ClassMember,
  ClassMethod,
  ClassNode,
  Visibility,
} from "../../../model/diagramTree";
import { toClassId, toMemberId, type ClassId } from "../../../../shared/ids";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "../toSourceLocation";

const VISIBILITY_PREFIXES = new Set<string>(["+", "-", "#", "~"]);

/**
 * Builds a class node from a class-declaration token.
 */
export function buildClassNode(token: ParseToken): ClassNode | null {
  if (token.type !== "classDeclaration") return null;

  const match = /^\s*class\s+(\w+)/.exec(token.raw);
  if (!match) return null;

  const id = toClassId(match[1]);
  const { members, annotation } = parseClassBody(id, token.blockTokens ?? []);

  return {
    kind: "class",
    id,
    annotation,
    members,
    location: toSourceLocation(token),
  };
}

function parseClassBody(
  classId: ClassId,
  blockTokens: readonly ParseToken[]
): {
  members: ClassMember[];
  annotation?: ClassAnnotation;
} {
  const members: ClassMember[] = [];
  let annotation: ClassAnnotation | undefined;

  for (const token of blockTokens) {
    const trimmed = token.raw.trim();
    if (trimmed === "") continue;

    const stereotypeMatch = /^<<(.+)>>$/.exec(trimmed);
    if (stereotypeMatch) {
      annotation = {
        value: stereotypeMatch[1].trim(),
        location: toSourceLocation(token),
      };
      continue;
    }

    const member = parseClassMember(classId, token);
    if (member) {
      members.push(member);
    }
  }

  return { members, annotation };
}

function parseClassMember(classId: ClassId, token: ParseToken): ClassMember | null {
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
): ClassField {
  const parts = declaration.split(/\s+/);
  const name = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const fieldType = parts.length > 1 ? parts.slice(0, -1).join(" ") : undefined;

  return {
    kind: "field",
    id: toMemberId(`${classId}:${token.lineNumber}`),
    visibility,
    name,
    fieldType,
    location: toSourceLocation(token),
  };
}

function parseMethodMember(
  classId: ClassId,
  token: ParseToken,
  visibility: Visibility,
  declaration: string
): ClassMethod {
  const methodMatch = /^([^\s(]+)\s*\(([^)]*)\)\s*(.*)$/.exec(declaration);

  if (!methodMatch) {
    return {
      kind: "method",
      id: toMemberId(`${classId}:${token.lineNumber}`),
      visibility,
      name: declaration,
      params: "",
      location: toSourceLocation(token),
    };
  }

  const returnType = methodMatch[3].trim();

  return {
    kind: "method",
    id: toMemberId(`${classId}:${token.lineNumber}`),
    visibility,
    name: methodMatch[1],
    returnType: returnType.length > 0 ? returnType : undefined,
    params: methodMatch[2],
    location: toSourceLocation(token),
  };
}
