/**
 * @fileoverview Extracts class declarations from tokenized Mermaid source.
 * Reads class body block lines into the DiagramTree class/member contract.
 */

import type {
  AppliesStyleEdge,
  ClassAnnotation,
  ClassField,
  ClassMember,
  ClassMethod,
  ClassNode,
  SourceLocation,
  Visibility,
} from "../../../models/classDiagram/diagramTreeModel";
import { toClassId, toStyleDefId } from "../../../models/classDiagram/primitives";
import type { TokenizedLine } from "../tokenizer";

const VISIBILITY_PREFIXES = new Set<string>(["+", "-", "#", "~"]);

/**
 * Extracts all declared classes from the tokenized source.
 * Returns class nodes and style application edges from "class Foo:::StyleName" syntax.
 *
 * @param lines - Flat tokenized line sequence from the tokenizer.
 * @returns Parsed class nodes and style application edges.
 */
export function parseClasses(lines: TokenizedLine[]): {
  nodes: ClassNode[];
  appliesStyleEdges: AppliesStyleEdge[];
} {
  const classMap = new Map<ClassNode["id"], ClassNode>();
  const appliesStyleEdges: AppliesStyleEdge[] = [];

  // First pass: collect explicit class declarations.
  for (const line of lines) {
    if (line.type !== "classDecl") continue;

    const match = /^\s*class\s+(\w+)/.exec(line.raw);
    if (!match) continue;

    const id = toClassId(match[1]);
    // Avoid overwriting if already inserted (shouldn't happen in valid source).
    if (!classMap.has(id)) {
      const { members, annotation } = parseClassBody(line.blockLines ?? []);

      classMap.set(id, {
        kind: "class",
        id,
        annotation,
        members,
        location: toSourceLocation(line),
      });
    }
  }

  // Second pass: collect style application edges from "class Foo:::StyleName" lines.
  for (const line of lines) {
    if (line.type !== "styleApplication") continue;

    const match = /^\s*class\s+(\w+):::(\w+)/.exec(line.raw);
    if (!match) continue;

    const id = toClassId(match[1]);
    const styleDefName = toStyleDefId(match[2]);

    appliesStyleEdges.push({
      kind: "appliesStyle",
      source: id,
      target: styleDefName,
      location: toSourceLocation(line),
    });
  }

  return { nodes: [...classMap.values()], appliesStyleEdges };
}

function parseClassBody(blockLines: readonly TokenizedLine[]): {
  members: ClassMember[];
  annotation?: ClassAnnotation;
} {
  const members: ClassMember[] = [];
  let annotation: ClassAnnotation | undefined;

  for (const line of blockLines) {
    const trimmed = line.raw.trim();
    if (trimmed === "") continue;

    const stereotypeMatch = /^<<(.+)>>$/.exec(trimmed);
    if (stereotypeMatch) {
      annotation = {
        value: stereotypeMatch[1].trim(),
        location: toSourceLocation(line),
      };
      continue;
    }

    const member = parseClassMember(line);
    if (member) {
      members.push(member);
    }
  }

  return { members, annotation };
}

function parseClassMember(line: TokenizedLine): ClassMember | null {
  const trimmed = line.raw.trim();
  const firstCharacter = trimmed.charAt(0);
  const hasExplicitVisibility = VISIBILITY_PREFIXES.has(firstCharacter);
  const visibility = hasExplicitVisibility ? (firstCharacter as Visibility) : "+";
  const declaration = hasExplicitVisibility ? trimmed.slice(1).trim() : trimmed;

  if (declaration === "") {
    return null;
  }

  if (declaration.includes("(")) {
    return parseMethodMember(line, visibility, declaration);
  }

  return parseFieldMember(line, visibility, declaration);
}

function parseFieldMember(
  line: TokenizedLine,
  visibility: Visibility,
  declaration: string
): ClassField {
  const parts = declaration.split(/\s+/);
  const name = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const fieldType = parts.length > 1 ? parts.slice(0, -1).join(" ") : undefined;

  return {
    kind: "field",
    visibility,
    name,
    fieldType,
    location: toSourceLocation(line),
  };
}

function parseMethodMember(
  line: TokenizedLine,
  visibility: Visibility,
  declaration: string
): ClassMethod {
  const methodMatch = /^([^\s(]+)\s*\(([^)]*)\)\s*(.*)$/.exec(declaration);

  if (!methodMatch) {
    return {
      kind: "method",
      visibility,
      name: declaration,
      params: "",
      location: toSourceLocation(line),
    };
  }

  const returnType = methodMatch[3].trim();

  return {
    kind: "method",
    visibility,
    name: methodMatch[1],
    returnType: returnType.length > 0 ? returnType : undefined,
    params: methodMatch[2],
    location: toSourceLocation(line),
  };
}

function toSourceLocation(line: TokenizedLine): SourceLocation {
  return {
    startLine: line.lineNumber,
    startChar: 0,
    endLine: line.lineNumber,
    endChar: line.raw.length,
    raw: line.raw,
  };
}
