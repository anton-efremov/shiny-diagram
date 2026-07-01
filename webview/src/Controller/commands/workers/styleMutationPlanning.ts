/**
 * @fileoverview Plans atomic class style mutations.
 */

import type { ClassId, StyleDefId } from "../../../shared/ids";
import { toStyleDefId } from "../../../shared/ids";
import type { StylePropertyName } from "../../../shared/style";
import type { DiagramGraph, StyleApplicationEdge, StyleDefNode } from "../../model/diagramGraph";
import type { SourceLocation } from "../../model/sourceLocation";
import type { CommandContext, CommandResult } from "../commandExecution";
import type { SourceEdit } from "../sourceEdit";
import {
  formatClassStyleApplication,
  formatClonedStyleDefProperty,
  formatMinimalStyleDef,
  formatRetargetedClassStyleApplication,
  formatStyleProperty,
} from "./sourceFormatting";

export type StyleMutationRequest = {
  readonly classIds: readonly ClassId[];
  readonly property: StylePropertyName;
  readonly value: string;
};

type StyleDefWithLocation = StyleDefNode & { readonly location: SourceLocation };
type StyleApplicationWithLocation = StyleApplicationEdge & { readonly location: SourceLocation };

/**
 * Plans one complete box-level style property mutation.
 */
export function planClassStyleMutation(
  command: StyleMutationRequest,
  context: CommandContext
): CommandResult {
  const validation = validateRequestedClasses(command.classIds, context.graph);
  if (!validation.ok) return validation;

  const eol = getLineEnding(context.sourceText);
  const selectedClassIds = new Set(command.classIds);
  const currentStyleByClassId = getCurrentStyleByClassId(context);
  const consumersByStyleId = getConsumersByStyleId(context.graph);
  const grouped = groupSelectedClasses(command.classIds, currentStyleByClassId);
  const reservedStyleIds = getReservedStyleIds(context.graph);
  const edits: SourceEdit[] = [];

  for (const group of grouped.styledGroups.values()) {
    const styleDef = getStyleDefWithLocation(context, group.styleDefId);
    if (!styleDef) {
      return { ok: false, problem: `StyleDef ${group.styleDefId} not found` };
    }

    const consumers = consumersByStyleId.get(group.styleDefId) ?? new Set<ClassId>();
    const allConsumersSelected = [...consumers].every((classId) => selectedClassIds.has(classId));

    if (allConsumersSelected) {
      edits.push(
        toReplacementEdit(
          styleDef.location,
          formatStyleProperty(styleDef, command.property, command.value)
        )
      );
      continue;
    }

    const isolatedStyleId = generateStyleDefId(group.styleDefId, reservedStyleIds);
    if (!isolatedStyleId) {
      return { ok: false, problem: `Could not generate style ID for ${group.styleDefId}` };
    }
    reservedStyleIds.add(isolatedStyleId);

    edits.push(
      toStyleDefInsertion(
        formatClonedStyleDefProperty(styleDef, isolatedStyleId, command.property, command.value),
        context,
        eol
      )
    );

    for (const edge of group.edges) {
      const replacementText = formatRetargetedClassStyleApplication(
        edge.location.raw,
        isolatedStyleId
      );
      if (!replacementText) {
        return { ok: false, problem: `Unsafe style application for class ${edge.targetId}` };
      }
      edits.push(toReplacementEdit(edge.location, replacementText));
    }
  }

  if (grouped.unstyledClassIds.length > 0) {
    const styleDefId = generateStyleDefId(toStyleDefId("ShinyStyle"), reservedStyleIds);
    if (!styleDefId) {
      return { ok: false, problem: "Could not generate style ID for unstyled classes" };
    }
    reservedStyleIds.add(styleDefId);

    edits.push(
      toStyleDefInsertion(
        formatMinimalStyleDef(styleDefId, command.property, command.value),
        context,
        eol
      )
    );
    edits.push(
      toStyleApplicationInsertion(
        grouped.unstyledClassIds
          .map((classId) => formatClassStyleApplication(classId, styleDefId))
          .join(eol),
        context,
        eol
      )
    );
  }

  const finalEdits = coalesceInsertions(edits);
  const overlap = findOverlappingReplacement(finalEdits);
  if (overlap) {
    return { ok: false, problem: "Overlapping style mutation ranges" };
  }

  return { ok: true, edits: finalEdits };
}

function validateRequestedClasses(
  classIds: readonly ClassId[],
  model: DiagramGraph
): CommandResult | { readonly ok: true } {
  if (classIds.length === 0) {
    return { ok: false, problem: "No classes to style" };
  }

  const seen = new Set<ClassId>();
  for (const classId of classIds) {
    if (seen.has(classId)) {
      return { ok: false, problem: `Duplicate style command class ${classId}` };
    }
    seen.add(classId);

    if (!model.classes.has(classId)) {
      return { ok: false, problem: `Class ${classId} not found` };
    }
  }

  return { ok: true };
}

function getCurrentStyleByClassId(
  context: CommandContext
): Map<ClassId, StyleApplicationWithLocation> {
  const styles = new Map<ClassId, StyleApplicationWithLocation>();
  for (const edge of context.graph.styleApplications.values()) {
    const location = context.provenance.styleApplications.get(edge.id);
    if (!location) continue;
    if (!styles.has(edge.targetId)) {
      styles.set(edge.targetId, { ...edge, location });
    }
  }
  return styles;
}

function getConsumersByStyleId(model: DiagramGraph): Map<StyleDefId, Set<ClassId>> {
  const consumers = new Map<StyleDefId, Set<ClassId>>();
  for (const edge of model.styleApplications.values()) {
    const existing = consumers.get(edge.styleDefId);
    if (existing) {
      existing.add(edge.targetId);
    } else {
      consumers.set(edge.styleDefId, new Set([edge.targetId]));
    }
  }
  return consumers;
}

function getReservedStyleIds(model: DiagramGraph): Set<StyleDefId> {
  return new Set([
    ...model.styleDefinitions.keys(),
    ...[...model.styleApplications.values()].map((edge) => edge.styleDefId),
  ]);
}

function groupSelectedClasses(
  classIds: readonly ClassId[],
  currentStyleByClassId: ReadonlyMap<ClassId, StyleApplicationWithLocation>
): {
  readonly styledGroups: Map<
    StyleDefId,
    { readonly styleDefId: StyleDefId; readonly edges: StyleApplicationWithLocation[] }
  >;
  readonly unstyledClassIds: ClassId[];
} {
  const styledGroups = new Map<
    StyleDefId,
    { readonly styleDefId: StyleDefId; readonly edges: StyleApplicationWithLocation[] }
  >();
  const unstyledClassIds: ClassId[] = [];

  for (const classId of classIds) {
    const edge = currentStyleByClassId.get(classId);
    if (!edge) {
      unstyledClassIds.push(classId);
      continue;
    }

    const existing = styledGroups.get(edge.styleDefId);
    if (existing) {
      existing.edges.push(edge);
    } else {
      styledGroups.set(edge.styleDefId, { styleDefId: edge.styleDefId, edges: [edge] });
    }
  }

  return { styledGroups, unstyledClassIds };
}

function generateStyleDefId(
  preferredBase: StyleDefId,
  reservedStyleIds: ReadonlySet<StyleDefId>
): StyleDefId | null {
  const base = sanitizeStyleDefId(`${preferredBase}Selected`) || "ShinyStyle";

  for (let index = 0; index < 1000; index++) {
    const suffix = index === 0 ? "" : String(index + 1);
    const candidate = toStyleDefId(`${base}${suffix}`);
    if (!reservedStyleIds.has(candidate)) return candidate;
  }

  return null;
}

function sanitizeStyleDefId(value: string): string {
  const sanitized = value.replace(/\W/g, "_").replace(/^_+/, "");
  return /^\d/.test(sanitized) ? `Style_${sanitized}` : sanitized;
}

function getStyleDefWithLocation(
  context: CommandContext,
  styleDefId: StyleDefId
): StyleDefWithLocation | null {
  const styleDef = context.graph.styleDefinitions.get(styleDefId);
  const location = context.provenance.styleDefinitions.get(styleDefId);
  return styleDef && location ? { ...styleDef, location } : null;
}

function toStyleDefInsertion(text: string, context: CommandContext, eol: string): SourceEdit {
  const styleDefs = [...context.graph.styleDefinitions.keys()]
    .flatMap((styleDefId) => {
      const styleDef = getStyleDefWithLocation(context, styleDefId);
      return styleDef ? [styleDef] : [];
    })
    .sort(compareByLocation);
  const lastStyleDef = styleDefs[styleDefs.length - 1];
  if (lastStyleDef) {
    return insertAfterLocation(lastStyleDef.location, text, eol);
  }

  return appendAfterDiagramContent(context.sourceText, text, eol);
}

function toStyleApplicationInsertion(
  text: string,
  context: CommandContext,
  eol: string
): SourceEdit {
  const styleApplications = [...context.graph.styleApplications.values()]
    .flatMap((styleApplication) => {
      const location = context.provenance.styleApplications.get(styleApplication.id);
      return location ? [{ ...styleApplication, location }] : [];
    })
    .sort(compareByLocation);
  const lastStyleApplication = styleApplications[styleApplications.length - 1];
  if (lastStyleApplication) {
    return insertAfterLocation(lastStyleApplication.location, text, eol);
  }

  const styleDefs = [...context.graph.styleDefinitions.keys()]
    .flatMap((styleDefId) => {
      const styleDef = getStyleDefWithLocation(context, styleDefId);
      return styleDef ? [styleDef] : [];
    })
    .sort(compareByLocation);
  const lastStyleDef = styleDefs[styleDefs.length - 1];
  if (lastStyleDef) {
    return insertAfterLocation(lastStyleDef.location, text, eol);
  }

  return appendAfterDiagramContent(context.sourceText, text, eol);
}

function insertAfterLocation(location: SourceLocation, text: string, eol: string): SourceEdit {
  return {
    start: { line: location.endLine, character: location.endChar },
    end: { line: location.endLine, character: location.endChar },
    replacementText: `${eol}${text}`,
  };
}

function appendAfterDiagramContent(sourceText: string, text: string, eol: string): SourceEdit {
  const sourceLines = sourceText.split(/\r?\n/);
  let anchorLine = sourceLines.length - 1;

  while (anchorLine > 0 && sourceLines[anchorLine].trim() === "") {
    anchorLine--;
  }

  const anchorCharacter = sourceLines[anchorLine]?.length ?? 0;

  return {
    start: { line: anchorLine, character: anchorCharacter },
    end: { line: anchorLine, character: anchorCharacter },
    replacementText: `${eol}${text}`,
  };
}

function toReplacementEdit(location: SourceLocation, replacementText: string): SourceEdit {
  return {
    start: { line: location.startLine, character: location.startChar },
    end: { line: location.endLine, character: location.endChar },
    replacementText,
  };
}

function coalesceInsertions(edits: readonly SourceEdit[]): SourceEdit[] {
  const coalesced = new Map<string, SourceEdit>();

  for (const edit of edits) {
    const key = `${edit.start.line}:${edit.start.character}:${edit.end.line}:${edit.end.character}`;
    const existing = coalesced.get(key);
    if (!existing) {
      coalesced.set(key, edit);
      continue;
    }

    if (isInsertion(existing) && isInsertion(edit)) {
      coalesced.set(key, {
        ...existing,
        replacementText: `${existing.replacementText}${edit.replacementText}`,
      });
      continue;
    }

    coalesced.set(`${key}:${coalesced.size}`, edit);
  }

  return [...coalesced.values()].sort(compareEdits);
}

function findOverlappingReplacement(edits: readonly SourceEdit[]): SourceEdit | null {
  const replacements = edits.filter((edit) => !isInsertion(edit)).sort(compareEdits);

  for (let index = 1; index < replacements.length; index++) {
    if (rangesOverlap(replacements[index - 1], replacements[index])) {
      return replacements[index];
    }
  }

  return null;
}

function rangesOverlap(left: SourceEdit, right: SourceEdit): boolean {
  if (left.end.line < right.start.line) return false;
  if (left.end.line === right.start.line && left.end.character <= right.start.character) {
    return false;
  }
  return true;
}

function isInsertion(edit: SourceEdit): boolean {
  return edit.start.line === edit.end.line && edit.start.character === edit.end.character;
}

function compareByLocation(
  left: { readonly location: SourceLocation },
  right: { readonly location: SourceLocation }
): number {
  return (
    left.location.startLine - right.location.startLine ||
    left.location.startChar - right.location.startChar
  );
}

function compareEdits(left: SourceEdit, right: SourceEdit): number {
  return left.start.line - right.start.line || left.start.character - right.start.character;
}

function getLineEnding(sourceText: string): string {
  return sourceText.includes("\r\n") ? "\r\n" : "\n";
}
