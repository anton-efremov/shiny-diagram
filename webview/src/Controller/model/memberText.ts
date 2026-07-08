/**
 * @fileoverview
 * Mermaid-compatible class-member text transforms.
 *
 * Evidence from Mermaid 11.15.0 bundled source:
 * - `ClassMember.parseMember` treats a method as text parsed around the last
 *   closing parenthesis and renders the return type after ` : `.
 * - `parseGenericTypes` pairs outer tildes from first to last, repeatedly.
 * - Mermaid has one rendered classifier style. Shiny stores both flags so the
 *   visual state can represent the product's two-toggle model; source text with
 *   both trailing classifiers is therefore a Shiny extension over Mermaid's
 *   single-style implementation.
 *
 * Public Mermaid parse/render verification in Node was infeasible in this repo:
 * the full `mermaid.parse` path requires DOMPurify/browser wiring and the
 * standalone `@mermaid-js/parser` package does not include class diagrams.
 */

import type { MemberKind } from "../../shared/uml";

export type DisplayMemberText = {
  readonly text: string;
  readonly isStatic: boolean;
  readonly isAbstract: boolean;
};

export function toDisplayMemberText(sourceText: string, kind: MemberKind): DisplayMemberText {
  const extracted = extractTrailingClassifiers(sourceText.trim());
  const text =
    kind === "method"
      ? toDisplayMethodText(extracted.text)
      : parseGenericTypes(extracted.text).trim();

  return {
    text,
    isStatic: extracted.isStatic,
    isAbstract: extracted.isAbstract,
  };
}

export function toSourceMemberText(member: DisplayMemberText, kind: MemberKind): string {
  const sourceText =
    kind === "method" ? toSourceMethodText(member.text) : toSourceGenericTypes(member.text);
  return `${sourceText}${member.isStatic ? "$" : ""}${member.isAbstract ? "*" : ""}`.trim();
}

function toDisplayMethodText(sourceText: string): string {
  const closingParen = sourceText.lastIndexOf(")");
  if (closingParen === -1) return parseGenericTypes(sourceText).trim();

  const signature = sourceText.slice(0, closingParen + 1);
  const returnType = sourceText.slice(closingParen + 1).trim();
  const displaySignature = parseGenericTypes(signature).trim();
  const displayReturnType = parseGenericTypes(returnType).trim();
  return displayReturnType ? `${displaySignature} : ${displayReturnType}` : displaySignature;
}

function toSourceMethodText(displayText: string): string {
  const closingParen = displayText.lastIndexOf(")");
  if (closingParen === -1) return toSourceGenericTypes(displayText).trim();

  const signature = displayText.slice(0, closingParen + 1);
  const tail = displayText.slice(closingParen + 1);
  const colon = tail.indexOf(":");
  if (colon === -1) return toSourceGenericTypes(displayText).trim();

  const returnType = tail.slice(colon + 1).trim();
  const sourceSignature = toSourceGenericTypes(signature).trim();
  const sourceReturnType = toSourceGenericTypes(returnType).trim();
  return sourceReturnType ? `${sourceSignature} ${sourceReturnType}` : sourceSignature;
}

function extractTrailingClassifiers(text: string): DisplayMemberText {
  let remaining = text.trimEnd();
  let isStatic = false;
  let isAbstract = false;

  while (remaining.endsWith("$") || remaining.endsWith("*")) {
    const classifier = remaining.at(-1);
    isStatic = isStatic || classifier === "$";
    isAbstract = isAbstract || classifier === "*";
    remaining = remaining.slice(0, -1).trimEnd();
  }

  return { text: remaining, isStatic, isAbstract };
}

export function parseGenericTypes(input: string): string {
  const inputSets = input.split(/(,)/);
  const output: string[] = [];

  for (let i = 0; i < inputSets.length; i++) {
    let thisSet = inputSets[i];
    if (thisSet === "," && i > 0 && i + 1 < inputSets.length) {
      const previousSet = inputSets[i - 1];
      const nextSet = inputSets[i + 1];
      if (shouldCombineSets(previousSet, nextSet)) {
        thisSet = `${previousSet},${nextSet}`;
        i++;
        output.pop();
      }
    }
    output.push(processGenericSet(thisSet));
  }

  return output.join("");
}

export function toSourceGenericTypes(input: string): string {
  return input.replaceAll("<", "~").replaceAll(">", "~");
}

function shouldCombineSets(previousSet: string, nextSet: string): boolean {
  return countOccurrence(previousSet, "~") === 1 && countOccurrence(nextSet, "~") === 1;
}

function processGenericSet(input: string): string {
  const tildeCount = countOccurrence(input, "~");
  let hasStartingTilde = false;
  let processed = input;

  if (tildeCount <= 1) return input;
  if (tildeCount % 2 !== 0 && processed.startsWith("~")) {
    processed = processed.substring(1);
    hasStartingTilde = true;
  }

  const chars = [...processed];
  let first = chars.indexOf("~");
  let last = chars.lastIndexOf("~");
  while (first !== -1 && last !== -1 && first !== last) {
    chars[first] = "<";
    chars[last] = ">";
    first = chars.indexOf("~");
    last = chars.lastIndexOf("~");
  }

  if (hasStartingTilde) chars.unshift("~");
  return chars.join("");
}

function countOccurrence(value: string, substring: string): number {
  return Math.max(0, value.split(substring).length - 1);
}
