import { describe, expect, it } from "vitest";
import type { SourceEdit } from "../model/sourceEdit";
import type { ProvenanceIndex } from "../model/provenanceIndex";
import { toClassId } from "../../shared/ids";
import { resolveIntents } from "./resolveIntents";

describe("foreign Mermaid default style preservation", () => {
  it("leaves the statement byte-identical while resolving an unrelated edit", () => {
    const source = `classDiagram
classDef default fill:pink
class User
`;
    const provenance = {
      classes: new Map([
        [
          toClassId("User"),
          {
            self: span(2, 0, 2, 10),
            fields: { declaredName: span(2, 6, 2, 10) },
          },
        ],
      ]),
    } as unknown as ProvenanceIndex;
    const edits = resolveIntents(
      [
        {
          kind: "replaceValue",
          target: { kind: "className", classId: toClassId("User") },
          payload: "Account",
        },
      ],
      provenance,
      source
    );

    const edited = applyEdits(source, edits);
    expect(edited).toContain("classDef default fill:pink");
    expect(edited).toContain("class Account");
  });
});

function span(startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
  return {
    start: { line: startLine, character: startCharacter },
    end: { line: endLine, character: endCharacter },
  };
}

function applyEdits(source: string, edits: readonly SourceEdit[]): string {
  const toOffset = (line: number, character: number): number =>
    source.split("\n").slice(0, line).join("\n").length + (line === 0 ? 0 : 1) + character;
  return [...edits]
    .sort(
      (left, right) =>
        toOffset(right.start.line, right.start.character) -
        toOffset(left.start.line, left.start.character)
    )
    .reduce(
      (text, edit) =>
        text.slice(0, toOffset(edit.start.line, edit.start.character)) +
        edit.replacementText +
        text.slice(toOffset(edit.end.line, edit.end.character)),
      source
    );
}
