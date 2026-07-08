import { describe, expect, it } from "vitest";
import type { EditorCommandTransaction } from "../src/View/commands";
import { toClassId } from "../src/shared/ids";
import { composeNoteId } from "../src/Controller/model/noteIdentity";
import type { SourceEdit, SourcePosition } from "../src/Controller/model/sourceEdit";
import { parseDiagram } from "../src/Controller/parse";
import { resolveIntents } from "../src/Controller/resolve";
import { translateCommands } from "../src/Controller/translate";

describe("note command round trips", () => {
  it("creates a note and then edits created note text in a separate transaction", () => {
    let source = baseSource();

    const create = dispatch(source, [
      {
        type: "note.create",
        text: "New note",
        spatial: { position: { x: 300, y: 120 }, size: { width: 160, height: 90 } },
        attachedToClassId: null,
      },
    ]);
    source = create.source;

    expect(create.outcome.notes.created).toEqual([composeNoteId(1)]);
    expect(parseReady(source).graph.notes.get(composeNoteId(1))).toMatchObject({
      text: "New note",
      spatial: { position: { x: 300, y: 120 }, size: { width: 160, height: 90 } },
    });

    source = dispatch(source, [
      { type: "note.text.set", noteId: composeNoteId(1), text: 'Edited "quoted" note' },
    ]).source;

    expect(parseReady(source).graph.notes.get(composeNoteId(1))?.text).toBe('Edited "quoted" note');
  });

  it("updates note spatial coordinates", () => {
    const source = dispatch(baseSource(), [
      {
        type: "note.spatial.set",
        noteId: composeNoteId(0),
        spatial: { position: { x: 10, y: 11 }, size: { width: 120, height: 70 } },
      },
    ]).source;

    expect(parseReady(source).graph.notes.get(composeNoteId(0))?.spatial).toEqual({
      position: { x: 10, y: 11 },
      size: { width: 120, height: 70 },
    });
  });

  it("attaches and detaches without changing the annotation line", () => {
    const attached = dispatch(baseSource(), [
      {
        type: "note.attachment.set",
        noteId: composeNoteId(0),
        attachedToClassId: toClassId("User"),
      },
    ]).source;

    expect(noteAnnotationLine(attached)).toBe("%% @note: x=100 y=120 w=200 h=80");
    expect(parseReady(attached).graph.notes.get(composeNoteId(0))?.attachedToClassId).toBe(
      toClassId("User")
    );

    const detached = dispatch(attached, [
      { type: "note.attachment.set", noteId: composeNoteId(0), attachedToClassId: null },
    ]).source;

    expect(noteAnnotationLine(detached)).toBe("%% @note: x=100 y=120 w=200 h=80");
    expect(parseReady(detached).graph.notes.get(composeNoteId(0))?.attachedToClassId).toBeNull();
  });

  it("duplicates a note with offset spatial data and reports the created id", () => {
    const result = dispatch(baseSource(), [{ type: "note.duplicate", noteId: composeNoteId(0) }]);
    const note = parseReady(result.source).graph.notes.get(composeNoteId(1));

    expect(result.outcome.notes.created).toEqual([composeNoteId(1)]);
    expect(note).toMatchObject({
      text: "Existing",
      spatial: { position: { x: 124, y: 144 }, size: { width: 200, height: 80 } },
    });
  });

  it("deletes an annotated note as annotation plus statement pair", () => {
    const source = dispatch(baseSource(), [
      { type: "note.delete", noteId: composeNoteId(0) },
    ]).source;

    expect(source).not.toContain("@note:");
    expect(source).not.toContain('note "Existing"');
    expect(parseReady(source).graph.notes.size).toBe(0);
  });
});

function baseSource(): string {
  return `classDiagram
class User
%% @spatial:User x=10 y=20 w=220 h=160
%% @note: x=100 y=120 w=200 h=80
note "Existing"
`;
}

function dispatch(source: string, transaction: EditorCommandTransaction) {
  const parsed = parseReady(source);
  const translated = translateCommands(transaction, parsed.graph, parsed.provenance, source);
  const edits = resolveIntents(translated.intents, parsed.provenance, source);
  return { source: applyEdits(source, edits), outcome: translated.outcome };
}

function parseReady(source: string) {
  const result = parseDiagram(source);
  if (result.status !== "ready") throw new Error(`Expected ready parse, got ${result.status}`);
  return result;
}

function noteAnnotationLine(source: string): string {
  return source.split("\n").find((line) => line.includes("@note:")) ?? "";
}

function applyEdits(source: string, edits: readonly SourceEdit[]): string {
  return [...edits]
    .sort(
      (left, right) => positionToOffset(source, right.start) - positionToOffset(source, left.start)
    )
    .reduce(
      (nextSource, edit) =>
        `${nextSource.slice(0, positionToOffset(source, edit.start))}${edit.replacementText}${nextSource.slice(
          positionToOffset(source, edit.end)
        )}`,
      source
    );
}

function positionToOffset(source: string, position: SourcePosition): number {
  let offset = 0;
  let line = 0;
  while (line < position.line && offset < source.length) {
    const nextLf = source.indexOf("\n", offset);
    if (nextLf === -1) return source.length;
    offset = nextLf + 1;
    line++;
  }
  return offset + position.character;
}
