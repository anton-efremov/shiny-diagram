/**
 * @fileoverview
 * Mermaid-compatible class-member text transforms.
 *
 * Evidence from Mermaid 11.15.0 bundled source:
 * - `ClassMember.parseMember` treats a method as text parsed around the last
 *   closing parenthesis and renders the return type after ` : `.
 * - `parseGenericTypes` pairs outer tildes from first to last, repeatedly.
 * - `ClassMember.classifier` stores one trailing classifier character, mapped
 *   by `parseClassifier()` to underline for `$` or italic for `*`.
 *
 * Public Mermaid parse/render verification in Node was infeasible in this repo:
 * the full `mermaid.parse` path requires DOMPurify/browser wiring and the
 * standalone `@mermaid-js/parser` package does not include class diagrams.
 */

import type { MemberClassifier, MemberKind } from "../../shared/uml";

export type DisplayMemberText = {
  readonly text: string;
  readonly classifier: MemberClassifier | null;
};

export function toDisplayMemberText(sourceText: string, kind: MemberKind): DisplayMemberText {
  return kind === "method"
    ? toDisplayMethodMemberText(sourceText.trim())
    : toDisplayFieldMemberText(sourceText.trim());
}

export function toSourceMemberText(member: DisplayMemberText, kind: MemberKind): string {
  const sourceText =
    kind === "method" ? toSourceMethodText(member.text) : toSourceGenericTypes(member.text);
  return `${sourceText}${toSourceClassifier(member.classifier)}`.trim();
}

export function getMethodReturnTypeColonIndex(displayText: string): number {
  const split = splitMethodTextAtReturnAnchor(displayText);
  return split === null ? -1 : displayText.indexOf(":", split.anchorIndex + 1);
}

function toDisplayMethodMemberText(sourceText: string): DisplayMemberText {
  const parsed = parseSourceMethodMember(sourceText);
  if (!parsed) return { text: parseGenericTypes(sourceText).trim(), classifier: null };

  const displaySignature = `${parsed.visibility}${parseGenericTypes(parsed.id)}(${parseGenericTypes(
    parsed.parameters
  )})`.trim();
  const displayReturnType = parseGenericTypes(parsed.returnType).trim();
  return {
    text: displayReturnType ? `${displaySignature} : ${displayReturnType}` : displaySignature,
    classifier: parsed.classifier,
  };
}

function toDisplayFieldMemberText(sourceText: string): DisplayMemberText {
  const parsed = parseSourceFieldMember(sourceText);
  return {
    text: `${parsed.visibility}${parseGenericTypes(parsed.id)}`.trim(),
    classifier: parsed.classifier,
  };
}

type ParsedSourceMember = {
  readonly visibility: string;
  readonly id: string;
  readonly parameters: string;
  readonly returnType: string;
  readonly classifier: MemberClassifier | null;
};

function parseSourceMethodMember(sourceText: string): ParsedSourceMember | null {
  const split = splitMethodTextAtReturnAnchor(sourceText);
  if (split === null) return null;

  const signature = split.beforeAnchor;
  const openingParen = signature.indexOf("(");
  if (openingParen === -1) return null;

  const visibilityCandidate = signature.substring(0, 1);
  const visibility = isVisibility(visibilityCandidate) ? visibilityCandidate : "";
  const idStart = visibility === "" ? 0 : 1;
  const potentialClassifier = split.afterAnchor.substring(0, 1).trim();
  let returnType = split.afterAnchor.slice(potentialClassifier === "" ? 0 : 1).trim();
  let classifier = toClassifier(potentialClassifier);

  if (classifier === null) {
    const lastChar = returnType.substring(returnType.length - 1);
    classifier = toClassifier(lastChar);
    if (classifier !== null) {
      returnType = returnType.substring(0, returnType.length - 1);
    }
  }

  return {
    visibility,
    id: normalizeMermaidMemberId(signature.slice(idStart, openingParen)),
    parameters: normalizeMermaidParameters(signature.slice(openingParen + 1)),
    returnType,
    classifier,
  };
}

function parseSourceFieldMember(sourceText: string): ParsedSourceMember {
  const firstChar = sourceText.substring(0, 1);
  const lastChar = sourceText.substring(sourceText.length - 1);
  const visibility = isVisibility(firstChar) ? firstChar : "";
  const classifier = toClassifier(lastChar);
  const id = sourceText.substring(
    visibility === "" ? 0 : 1,
    classifier === null ? sourceText.length : sourceText.length - 1
  );

  return {
    visibility,
    id: normalizeMermaidMemberId(id),
    parameters: "",
    returnType: "",
    classifier,
  };
}

function normalizeMermaidMemberId(id: string): string {
  return id.startsWith(" ") ? ` ${id.trim()}` : id.trim();
}

function normalizeMermaidParameters(parameters: string): string {
  return parameters.trim().replaceAll(/:\s+\(\)/g, ":()");
}

function isVisibility(value: string): boolean {
  return value === "#" || value === "+" || value === "~" || value === "-" || value === "";
}

function toClassifier(value: string): MemberClassifier | null {
  switch (value) {
    case "$":
      return "static";
    case "*":
      return "abstract";
    default:
      return null;
  }
}

function toSourceClassifier(classifier: MemberClassifier | null): string {
  switch (classifier) {
    case "static":
      return "$";
    case "abstract":
      return "*";
    case null:
      return "";
  }
}

function toSourceMethodText(displayText: string): string {
  const colon = getMethodReturnTypeColonIndex(displayText);
  if (colon === -1) return toSourceGenericTypes(displayText).trim();

  const split = splitMethodTextAtReturnAnchor(displayText);
  if (split === null) return toSourceGenericTypes(displayText).trim();

  const signature = displayText.slice(0, split.anchorIndex + 1);
  const returnType = displayText.slice(colon + 1).trim();
  const sourceSignature = toSourceGenericTypes(signature).trim();
  const sourceReturnType = toSourceGenericTypes(returnType).trim();
  return sourceReturnType ? `${sourceSignature} ${sourceReturnType}` : sourceSignature;
}

function splitMethodTextAtReturnAnchor(text: string): {
  readonly beforeAnchor: string;
  readonly afterAnchor: string;
  readonly anchorIndex: number;
} | null {
  const anchorIndex = text.lastIndexOf(")");
  if (anchorIndex === -1) return null;
  return {
    beforeAnchor: text.slice(0, anchorIndex),
    afterAnchor: text.slice(anchorIndex + 1),
    anchorIndex,
  };
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
