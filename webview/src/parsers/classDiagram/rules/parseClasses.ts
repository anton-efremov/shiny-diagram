/**
 * @fileoverview Extracts class declarations from tokenized Mermaid source.
 * Reads class body block lines into the DiagramModel class/member contract.
 */

import type { ClassMember, ClassNode, Visibility } from "../diagramTreeModel";
import type { TokenizedLine } from "../tokenizer";

const VISIBILITY_PREFIXES = new Set<string>(["+", "-", "#", "~"]);

/**
 * Extracts all declared classes from the tokenized source.
 * Merges styleApplication lines into the matching ClassNode so each node
 * carries the styleDefName resolved from "class Foo:::StyleName" syntax.
 *
 * @param lines - Flat tokenized line sequence from the tokenizer.
 * @returns Array of ClassNode values with parsed body members.
 */
export function parseClasses(lines: TokenizedLine[]): ClassNode[] {
  const classMap = new Map<string, ClassNode>();

  // First pass: collect explicit class declarations.
  for (const line of lines) {
    if (line.type !== "classDecl") continue;

    const match = /^\s*class\s+(\w+)/.exec(line.raw);
    if (!match) continue;

    const id = match[1];
    // Avoid overwriting if already inserted (shouldn't happen in valid source).
    if (!classMap.has(id)) {
      const { members, stereotype } = parseClassBody(line.blockLines ?? []);

      classMap.set(id, {
        id,
        stereotype,
        members,
        location: { line: line.lineNumber, raw: line.raw },
      });
    }
  }

  // Second pass: attach styleDefName from "class Foo:::StyleName" lines.
  for (const line of lines) {
    if (line.type !== "styleApplication") continue;

    const match = /^\s*class\s+(\w+):::(\w+)/.exec(line.raw);
    if (!match) continue;

    const id = match[1];
    const styleDefName = match[2];

    const existing = classMap.get(id);
    if (existing) {
      classMap.set(id, { ...existing, styleDefName });
    }
  }

  return [...classMap.values()];
}

function parseClassBody(blockLines: readonly TokenizedLine[]): {
  members: ClassMember[];
  stereotype?: string;
} {
  const members: ClassMember[] = [];
  let stereotype: string | undefined;

  for (const line of blockLines) {
    const trimmed = line.raw.trim();
    if (trimmed === "") continue;

    const stereotypeMatch = /^<<(.+)>>$/.exec(trimmed);
    if (stereotypeMatch) {
      stereotype = stereotypeMatch[1].trim();
      continue;
    }

    const member = parseClassMember(line);
    if (member) {
      members.push(member);
    }
  }

  return { members, stereotype };
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
): ClassMember {
  const parts = declaration.split(/\s+/);
  const name = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const type = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";

  return {
    visibility,
    name,
    type,
    isMethod: false,
    location: { line: line.lineNumber, raw: line.raw },
  };
}

function parseMethodMember(
  line: TokenizedLine,
  visibility: Visibility,
  declaration: string
): ClassMember {
  const methodMatch = /^([^\s(]+)\s*\(([^)]*)\)\s*(.*)$/.exec(declaration);

  if (!methodMatch) {
    return {
      visibility,
      name: declaration,
      type: "",
      isMethod: true,
      params: "",
      location: { line: line.lineNumber, raw: line.raw },
    };
  }

  return {
    visibility,
    name: methodMatch[1],
    type: methodMatch[3].trim(),
    isMethod: true,
    params: methodMatch[2],
    location: { line: line.lineNumber, raw: line.raw },
  };
}
