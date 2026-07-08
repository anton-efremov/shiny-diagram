/**
 * @fileoverview Builds class nodes and members from class-declaration tokens.
 */

import { toDisplayMemberText } from "../../../model/memberText";
import { IDENTITY_PATTERN, readIdentity } from "../../../model/identitySpelling";
import type { ClassMember, ClassNode } from "../../../model/diagramGraph";
import type { SourceSpan } from "../../../model/sourceEdit";
import { toAttributeId, toClassId, toMethodId, type ClassId } from "../../../../shared/ids";
import type { ParseToken } from "../tokenizer";
import { toSourceSpan } from "../toSourceSpan";

export type ParsedClassNode = {
  readonly node: ClassNode;
  readonly location: SourceSpan;
  readonly memberLocations: ReadonlyMap<
    ClassMember["id"],
    { readonly self: SourceSpan; readonly text: SourceSpan }
  >;
};

/**
 * Builds a class node from a class-declaration token.
 */
export function buildClassNode(token: ParseToken): ParsedClassNode | null {
  if (token.type !== "classDeclaration") return null;

  const match = new RegExp(
    `^\\s*class\\s+(${IDENTITY_PATTERN})(?:~([^~]*)~)?(?:\\s*\\["([^"]*)"\\])?`
  ).exec(token.raw);
  if (!match) return null;

  const identity = readIdentity(match[1]);
  const id = toClassId(identity);
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
      name: identity,
      label: match[3] ?? identity,
      genericType: match[2] ?? null,
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
  attributes: ClassMember[];
  methods: ClassMember[];
  annotation: string | null;
  memberLocations: Map<ClassMember["id"], { readonly self: SourceSpan; readonly text: SourceSpan }>;
} {
  const attributes: ClassMember[] = [];
  const methods: ClassMember[] = [];
  const memberLocations = new Map<
    ClassMember["id"],
    { readonly self: SourceSpan; readonly text: SourceSpan }
  >();
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
      if (member.kind === "field") {
        attributes.push(member.member);
        memberLocations.set(member.member.id, member.location);
      } else {
        methods.push(member.member);
        memberLocations.set(member.member.id, member.location);
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
      readonly kind: "field";
      readonly member: ClassMember;
      readonly location: { readonly self: SourceSpan; readonly text: SourceSpan };
    }
  | {
      readonly kind: "method";
      readonly member: ClassMember;
      readonly location: { readonly self: SourceSpan; readonly text: SourceSpan };
    }
  | null {
  const trimmed = token.raw.trim();
  if (trimmed === "") return null;

  const kind = isMethodDeclaration(trimmed) ? "method" : "field";
  const display = toDisplayMemberText(trimmed, kind);
  return {
    kind,
    location: {
      self: toSourceSpan(token),
      text: toTrimmedLineSpan(token),
    },
    member: {
      id:
        kind === "method"
          ? toMethodId(`${classId}:${token.lineNumber}`)
          : toAttributeId(`${classId}:${token.lineNumber}`),
      text: display.text,
      classifier: display.classifier,
    },
  };
}

export function buildShortClassMember(token: ParseToken): {
  readonly classId: ClassId;
  readonly kind: "field" | "method";
  readonly member: ClassMember;
  readonly ownerLocation: SourceSpan;
  readonly textLocation: SourceSpan;
} | null {
  const match = new RegExp(`^(\\s*)(${IDENTITY_PATTERN})(\\s*:\\s*)(.+)$`).exec(token.raw);
  if (!match) return null;

  const classId = toClassId(readIdentity(match[2]));
  const sourceText = match[4].trim();
  if (sourceText === "") return null;

  const kind = isMethodDeclaration(sourceText) ? "method" : "field";
  const display = toDisplayMemberText(sourceText, kind);
  const ownerStart = match[1].length;
  const textStart = match[1].length + match[2].length + match[3].length + match[4].search(/\S/);

  return {
    classId,
    kind,
    ownerLocation: {
      start: { line: token.lineNumber, character: ownerStart },
      end: { line: token.lineNumber, character: ownerStart + match[2].length },
    },
    textLocation: {
      start: { line: token.lineNumber, character: textStart },
      end: {
        line: token.lineNumber,
        character: textStart + sourceText.length,
      },
    },
    member: {
      id:
        kind === "method"
          ? toMethodId(`${classId}:${token.lineNumber}`)
          : toAttributeId(`${classId}:${token.lineNumber}`),
      text: display.text,
      classifier: display.classifier,
    },
  };
}

function isMethodDeclaration(text: string): boolean {
  return /\(.*\)/.test(text);
}

function toTrimmedLineSpan(token: ParseToken): SourceSpan {
  const startOffset = token.raw.search(/\S/);
  const endOffset = token.raw.search(/\s*$/);
  const start = startOffset === -1 ? 0 : startOffset;
  const end = endOffset === -1 ? token.raw.length : endOffset;
  return {
    start: { line: token.lineNumber, character: start },
    end: { line: token.lineNumber, character: end },
  };
}
