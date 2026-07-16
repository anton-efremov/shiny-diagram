import { describe, expect, it } from "vitest";
import { toClassId, toRelationshipId } from "../../shared/ids";
import type { ProvenanceIndex } from "../model/provenanceIndex";
import type { SourceEdit } from "../model/sourceEdit";
import type { WriteIntent } from "../translate";
import { resolveIntents } from "./resolveIntents";

const relationshipId = toRelationshipId("relationship:0");

describe("clause resolution", () => {
  it.each(["A --> B : owns", "A --> B:owns", "A --> B  :  owns"])(
    "absorbs relationship-label presentation in %s",
    (statement) => {
      expect(resolveRelationship(statement, { kind: "relationshipLabel", relationshipId })).toBe(
        "A --> B"
      );
    }
  );

  it.each(['A "1" --> "*" B', 'A "1"--> "*" B', 'A  "1"  -->  "*"  B'])(
    "absorbs quoted multiplicities and normalizes their joins in %s",
    (statement) => {
      expect(
        resolveRelationship(statement, [
          { kind: "relationshipSourceMultiplicity", relationshipId },
          { kind: "relationshipTargetMultiplicity", relationshipId },
        ])
      ).toBe("A --> B");
    }
  );

  it("coalesces clauses inserted at one component in intent order", () => {
    const classId = toClassId("Box");
    const source = "classDiagram\nclass Box\n";
    const provenance = {
      classes: new Map([
        [
          classId,
          {
            self: span(1, 0, 1, 9),
            header: span(1, 0, 1, 9),
            body: null,
            fields: { declaredName: span(1, 6, 1, 9) },
          },
        ],
      ]),
    } as unknown as ProvenanceIndex;
    const name = { kind: "className" as const, classId };
    const edits = resolveIntents(
      [
        {
          kind: "insertClause",
          payload: "~T~",
          anchor: {
            kind: "afterComponent",
            clause: { kind: "classGeneric", classId },
            component: name,
          },
        },
        {
          kind: "insertClause",
          payload: '["Label"]',
          anchor: {
            kind: "afterComponent",
            clause: { kind: "classLabel", classId },
            component: name,
          },
        },
      ],
      provenance,
      source
    );
    expect(edits).toHaveLength(1);
    expect(edits[0].replacementText).toBe('~T~["Label"]');
  });
});

describe("co-located spatial insertion", () => {
  it("keeps one family separator and no blank line between generated annotations", () => {
    const classId = toClassId("Existing");
    const source = "classDiagram\nclass Existing\n";
    const provenance = {
      classes: new Map([
        [
          classId,
          {
            self: span(1, 0, 1, 14),
            header: span(1, 0, 1, 14),
            body: null,
            fields: { declaredName: span(1, 6, 1, 14) },
          },
        ],
      ]),
    } as unknown as ProvenanceIndex;
    const anchor = {
      kind: "afterDifferentKind" as const,
      statement: { kind: "class" as const, classId },
    };
    const edits = resolveIntents(
      [
        { kind: "insertStatement", payload: "%% @spatial:A x=0 y=0 w=1 h=1", anchor },
        { kind: "insertStatement", payload: "%% @spatial:B x=1 y=1 w=1 h=1", anchor },
      ],
      provenance,
      source
    );
    expect(applyEdits(source, edits)).toBe(
      "classDiagram\nclass Existing\n\n%% @spatial:A x=0 y=0 w=1 h=1\n%% @spatial:B x=1 y=1 w=1 h=1\n"
    );
  });
});

function resolveRelationship(
  statement: string,
  target:
    | Extract<WriteIntent, { kind: "deleteClause" }>["target"]
    | readonly Extract<WriteIntent, { kind: "deleteClause" }>["target"][]
): string {
  const source = `classDiagram\n${statement}\n`;
  const provenance = relationshipProvenance(statement);
  const targets = Array.isArray(target) ? target : [target];
  const edits = resolveIntents(
    targets.map((item) => ({ kind: "deleteClause" as const, target: item })),
    provenance,
    source
  );
  return applyEdits(source, edits).split("\n")[1];
}

function relationshipProvenance(statement: string): ProvenanceIndex {
  const sourceMultiplicity = quotedInner(statement, 0);
  const targetMultiplicity = quotedInner(statement, 1);
  const labelText = /:\s*(.+)$/.exec(statement)?.[1];
  const labelStart = labelText ? statement.lastIndexOf(labelText) : -1;
  return {
    relationships: new Map([
      [
        relationshipId,
        {
          self: span(1, 0, 1, statement.length),
          fields: {
            sourceEndpoint: span(1, statement.indexOf("A"), 1, statement.indexOf("A") + 1),
            operator: span(1, statement.indexOf("-->"), 1, statement.indexOf("-->") + 3),
            targetEndpoint: span(1, statement.lastIndexOf("B"), 1, statement.lastIndexOf("B") + 1),
            ...(sourceMultiplicity ? { sourceMultiplicity } : {}),
            ...(targetMultiplicity ? { targetMultiplicity } : {}),
            ...(labelStart >= 0 ? { label: span(1, labelStart, 1, statement.length) } : {}),
          },
        },
      ],
    ]),
  } as unknown as ProvenanceIndex;
}

function quotedInner(statement: string, ordinal: number) {
  const matches = [...statement.matchAll(/"([^"]+)"/g)];
  const match = matches[ordinal];
  return match?.index === undefined
    ? undefined
    : span(1, match.index + 1, 1, match.index + 1 + match[1].length);
}

function span(startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
  return {
    start: { line: startLine, character: startCharacter },
    end: { line: endLine, character: endCharacter },
  };
}

function applyEdits(source: string, edits: readonly SourceEdit[]): string {
  const offset = (line: number, character: number) =>
    source.split("\n").slice(0, line).join("\n").length + (line === 0 ? 0 : 1) + character;
  return [...edits]
    .sort(
      (a, b) => offset(b.start.line, b.start.character) - offset(a.start.line, a.start.character)
    )
    .reduce(
      (text, edit) =>
        text.slice(0, offset(edit.start.line, edit.start.character)) +
        edit.replacementText +
        text.slice(offset(edit.end.line, edit.end.character)),
      source
    );
}
