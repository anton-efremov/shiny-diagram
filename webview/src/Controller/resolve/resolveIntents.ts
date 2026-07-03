/**
 * @fileoverview Resolves logical write intents into concrete source edits.
 */

import type { ProvenanceIndex, SourceLocation } from "../model/provenanceIndex";
import type { SourceEdit, SourcePosition } from "../model/sourceEdit";
import type {
  BlockRef,
  EntryAnchor,
  EntryRef,
  StatementAnchor,
  StatementRef,
  StyleListRef,
  ValueRef,
  WriteIntent,
} from "../translate";

type ResolvedAnchor = {
  readonly location: SourceLocation;
  readonly indent: string;
};

export function resolveIntents(
  intents: readonly WriteIntent[],
  provenance: ProvenanceIndex,
  sourceText: string
): SourceEdit[] {
  const eol = detectEol(sourceText);
  const edits = intents.map((intent) => buildEdit(intent, provenance, sourceText, eol));
  return assertNoOverlaps(coalesceInsertions(edits));
}

function buildEdit(
  intent: WriteIntent,
  provenance: ProvenanceIndex,
  sourceText: string,
  eol: string
): SourceEdit {
  switch (intent.kind) {
    case "insertStatement": {
      const anchor = resolveStatementAnchor(intent.anchor, provenance, sourceText);
      const lines = intent.payload.split("\n").map((line) => `${anchor.indent}${line}`);
      const position = toEndPosition(anchor.location);
      return {
        start: position,
        end: position,
        replacementText: `${eol}${lines.join(eol)}`,
      };
    }
    case "deleteStatement":
      return toDeleteStatementEdit(resolveStatementRef(intent.target, provenance), sourceText);

    case "insertEntry": {
      const anchor = resolveEntryAnchor(intent.anchor, provenance);
      const position =
        intent.anchor.kind === "afterEntry"
          ? toEndPosition(anchor.location)
          : toStartPosition(anchor.location);
      const prefix = intent.anchor.kind === "afterEntry" ? "," : "";
      return { start: position, end: position, replacementText: `${prefix}${intent.payload}` };
    }

    case "deleteEntry":
      return toDeleteEntryEdit(resolveEntryRef(intent.target, provenance), sourceText);

    case "replaceValue": {
      const location = resolveValueRef(intent.target, provenance);
      return {
        start: toStartPosition(location),
        end: toEndPosition(location),
        replacementText: intent.payload,
      };
    }
  }
}

function resolveStatementAnchor(
  anchor: StatementAnchor,
  provenance: ProvenanceIndex,
  sourceText: string
): ResolvedAnchor {
  if (anchor.kind === "afterStatement") {
    const location = resolveStatementRef(anchor.statement, provenance);
    return { location, indent: getLineIndent(sourceText, location.startLine) };
  }

  const location = resolveBlockRef(anchor.block, provenance).header;
  return {
    location,
    indent: `${getLineIndent(sourceText, location.startLine)}${deriveIndentStep(
      anchor.block,
      provenance,
      sourceText
    )}`,
  };
}

function resolveEntryAnchor(anchor: EntryAnchor, provenance: ProvenanceIndex): ResolvedAnchor {
  if (anchor.kind === "afterEntry") {
    return { location: resolveEntryRef(anchor.entry, provenance), indent: "" };
  }
  return { location: resolveStyleListRef(anchor.list, provenance), indent: "" };
}

function resolveStatementRef(ref: StatementRef, provenance: ProvenanceIndex): SourceLocation {
  switch (ref.kind) {
    case "class":
      return requireRecord(provenance.classes.get(ref.classId), `class ${ref.classId}`).self;
    case "relationship":
      return requireRecord(
        provenance.relationships.get(ref.relationshipId),
        `relationship ${ref.relationshipId}`
      ).self;
    case "classDirectStyle":
      return requireRecord(
        provenance.classDirectStyles.get(ref.classId),
        `direct style ${ref.classId}`
      ).self;
    case "styleApplication":
      return requireRecord(
        provenance.styleApplications.get(ref.styleApplicationId),
        `style application ${ref.styleApplicationId}`
      ).self;
    case "classSpatial":
      return requireRecord(provenance.classSpatial.get(ref.classId), `spatial ${ref.classId}`).self;
    case "namespace":
      return requireRecord(
        provenance.namespaces.get(ref.namespaceId),
        `namespace ${ref.namespaceId}`
      ).self;
    case "member":
      return requireRecord(provenance.members.get(ref.memberId), `member ${ref.memberId}`).self;
    case "styleDefinition":
      return requireRecord(
        provenance.styleDefinitions.get(ref.styleDefId),
        `style definition ${ref.styleDefId}`
      ).self;
    case "namespaceSpatial":
      return requireRecord(
        provenance.namespaceSpatial.get(ref.namespaceId),
        `namespace spatial ${ref.namespaceId}`
      ).self;
    case "note":
      return requireRecord(provenance.notes.get(ref.noteId), `note ${ref.noteId}`).self;
  }
}

function resolveEntryRef(ref: EntryRef, provenance: ProvenanceIndex): SourceLocation {
  switch (ref.kind) {
    case "directStyleProperty":
      return requireRecord(
        provenance.classDirectStyles.get(ref.classId)?.fields.properties[ref.property],
        `direct style property ${ref.classId}.${ref.property}`
      ).entry;
    case "styleDefProperty":
      return requireRecord(
        provenance.styleDefinitions.get(ref.styleDefId)?.fields.properties[ref.property],
        `styleDef property ${ref.styleDefId}.${ref.property}`
      ).entry;
  }
}

function resolveValueRef(ref: ValueRef, provenance: ProvenanceIndex): SourceLocation {
  switch (ref.kind) {
    case "className":
      return requireRecord(provenance.classes.get(ref.classId), `class ${ref.classId}`).fields
        .declaredName;
    case "directStylePropertyValue":
      return requireRecord(
        provenance.classDirectStyles.get(ref.classId)?.fields.properties[ref.property],
        `direct style property value ${ref.classId}.${ref.property}`
      ).value;
    case "spatialCoord": {
      if (ref.target.kind !== "class") {
        throw new Error(`Unsupported spatial target ${ref.target.kind}`);
      }
      return requireRecord(
        provenance.classSpatial.get(ref.target.classId),
        `spatial ${ref.target.classId}`
      ).fields[ref.coord];
    }
    case "spatialTarget": {
      if (ref.target.kind !== "class") {
        throw new Error(`Unsupported spatial target ${ref.target.kind}`);
      }
      return requireRecord(
        provenance.classSpatial.get(ref.target.classId),
        `spatial ${ref.target.classId}`
      ).fields.target;
    }
    case "relationshipEndpoint": {
      const fields = requireRecord(
        provenance.relationships.get(ref.relationshipId),
        `relationship ${ref.relationshipId}`
      ).fields;
      return ref.side === "source" ? fields.sourceEndpoint : fields.targetEndpoint;
    }
    case "relationshipMultiplicity": {
      const fields = requireRecord(
        provenance.relationships.get(ref.relationshipId),
        `relationship ${ref.relationshipId}`
      ).fields;
      const location =
        ref.side === "source" ? fields.sourceMultiplicity : fields.targetMultiplicity;
      return requireRecord(location, `relationship multiplicity ${ref.relationshipId}.${ref.side}`);
    }
    case "relationshipOperator":
      return requireRecord(
        provenance.relationships.get(ref.relationshipId),
        `relationship ${ref.relationshipId}`
      ).fields.operator;
    case "relationshipLabel":
      return requireRecord(
        provenance.relationships.get(ref.relationshipId)?.fields.label,
        `relationship label ${ref.relationshipId}`
      );
    case "styleApplicationTarget":
      return requireRecord(
        provenance.styleApplications.get(ref.styleApplicationId),
        `style application ${ref.styleApplicationId}`
      ).fields.target;
    case "styleApplicationName":
      return requireRecord(
        provenance.styleApplications.get(ref.styleApplicationId),
        `style application ${ref.styleApplicationId}`
      ).fields.styleName;
    case "namespaceName":
      return requireRecord(
        provenance.namespaces.get(ref.namespaceId),
        `namespace ${ref.namespaceId}`
      ).fields.declaredName;
    case "memberName":
      return requireRecord(provenance.members.get(ref.memberId), `member ${ref.memberId}`).fields
        .name;
    case "memberOwner": {
      const member = requireRecord(provenance.members.get(ref.memberId), `member ${ref.memberId}`);
      if (member.sourceForm !== "shortMember") {
        throw new Error(`Member ${ref.memberId} has no owner span`);
      }
      return member.fields.owner;
    }
    case "styleDefPropertyValue":
      return requireRecord(
        provenance.styleDefinitions.get(ref.styleDefId)?.fields.properties[ref.property],
        `styleDef property value ${ref.styleDefId}.${ref.property}`
      ).value;
  }
}

function resolveBlockRef(block: BlockRef, provenance: ProvenanceIndex) {
  switch (block.kind) {
    case "diagram":
      return provenance.diagram;
    case "class":
      return requireRecord(provenance.classes.get(block.classId), `class ${block.classId}`);
    case "namespace":
      return requireRecord(
        provenance.namespaces.get(block.namespaceId),
        `namespace ${block.namespaceId}`
      );
  }
}

function resolveStyleListRef(ref: StyleListRef, provenance: ProvenanceIndex): SourceLocation {
  switch (ref.kind) {
    case "directStyle":
      return requireRecord(
        provenance.classDirectStyles.get(ref.classId),
        `direct style ${ref.classId}`
      ).fields.propertyList;
    case "styleDef":
      return requireRecord(
        provenance.styleDefinitions.get(ref.styleDefId),
        `styleDef ${ref.styleDefId}`
      ).fields.propertyList;
  }
}

function deriveIndentStep(
  block: BlockRef,
  provenance: ProvenanceIndex,
  sourceText: string
): string {
  const record = resolveBlockRef(block, provenance);
  const body = record.body;
  if (body) {
    const parentIndent = getLineIndent(sourceText, record.header.startLine);
    for (let line = body.startLine; line <= body.endLine; line++) {
      const raw = getLine(sourceText, line);
      if (raw.trim() === "" || raw.trim() === "}") continue;
      const childIndent = getLineIndent(sourceText, line);
      if (childIndent.length > parentIndent.length) return childIndent.slice(parentIndent.length);
    }
  }
  return "  ";
}

function toDeleteStatementEdit(location: SourceLocation, sourceText: string): SourceEdit {
  const lines = sourceText.split("\n");
  const hasFollowingLine = location.endLine < lines.length - 1;
  return {
    start: { line: location.startLine, character: 0 },
    end: {
      line: hasFollowingLine ? location.endLine + 1 : location.endLine,
      character: hasFollowingLine ? 0 : getLine(sourceText, location.endLine).length,
    },
    replacementText: "",
  };
}

function toDeleteEntryEdit(location: SourceLocation, sourceText: string): SourceEdit {
  const line = getLine(sourceText, location.startLine);
  let start = location.startChar;
  let end = location.endChar;

  if (line[end] === ",") {
    end++;
  } else {
    let cursor = start - 1;
    while (cursor >= 0 && /\s/.test(line[cursor])) cursor--;
    if (line[cursor] === ",") start = cursor;
  }

  return {
    start: { line: location.startLine, character: start },
    end: { line: location.endLine, character: end },
    replacementText: "",
  };
}

function coalesceInsertions(edits: readonly SourceEdit[]): SourceEdit[] {
  const grouped = new Map<string, SourceEdit>();

  for (const edit of edits) {
    const key = `${edit.start.line}:${edit.start.character}:${edit.end.line}:${edit.end.character}`;
    const existing = grouped.get(key);
    if (existing && isInsertion(existing) && isInsertion(edit)) {
      grouped.set(key, {
        ...existing,
        replacementText: `${existing.replacementText}${edit.replacementText}`,
      });
    } else if (!existing) {
      grouped.set(key, edit);
    } else {
      grouped.set(`${key}:${grouped.size}`, edit);
    }
  }

  return [...grouped.values()].sort(compareEdits);
}

function assertNoOverlaps(edits: readonly SourceEdit[]): SourceEdit[] {
  const sorted = [...edits].sort(compareEdits);
  for (let index = 1; index < sorted.length; index++) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (positionsOverlap(previous.end, current.start)) {
      throw new Error("Overlapping source edits");
    }
  }
  return sorted;
}

function positionsOverlap(leftEnd: SourcePosition, rightStart: SourcePosition): boolean {
  if (leftEnd.line < rightStart.line) return false;
  if (leftEnd.line === rightStart.line && leftEnd.character <= rightStart.character) return false;
  return true;
}

function compareEdits(left: SourceEdit, right: SourceEdit): number {
  return left.start.line - right.start.line || left.start.character - right.start.character;
}

function isInsertion(edit: SourceEdit): boolean {
  return edit.start.line === edit.end.line && edit.start.character === edit.end.character;
}

function toStartPosition(location: SourceLocation): SourcePosition {
  return { line: location.startLine, character: location.startChar };
}

function toEndPosition(location: SourceLocation): SourcePosition {
  return { line: location.endLine, character: location.endChar };
}

function getLine(sourceText: string, lineNumber: number): string {
  return sourceText.split(/\r?\n/)[lineNumber] ?? "";
}

function getLineIndent(sourceText: string, lineNumber: number): string {
  return /^\s*/.exec(getLine(sourceText, lineNumber))?.[0] ?? "";
}

function detectEol(sourceText: string): string {
  return sourceText.includes("\r\n") ? "\r\n" : "\n";
}

function requireRecord<T>(value: T | null | undefined, description: string): T {
  if (!value) throw new Error(`Missing provenance for ${description}`);
  return value;
}
