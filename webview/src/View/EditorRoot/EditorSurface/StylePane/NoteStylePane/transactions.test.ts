import { describe, expect, it } from "vitest";
import { toClassId, toNoteId } from "../../../../../shared/ids";
import type { NoteView } from "../../../../views/schema";
import {
  toNoteDeleteTransaction,
  toNoteDetachTransaction,
  toNoteDuplicateTransaction,
} from "./transactions";

describe("NoteStylePane transactions", () => {
  const view: NoteView = {
    noteId: toNoteId("note:0"),
    text: "Note",
    bounds: { x: 1, y: 2, w: 100, h: 60 },
    attachedToClassId: toClassId("User"),
  };

  it("builds detach, duplicate, and delete transactions", () => {
    expect(toNoteDetachTransaction(view)).toEqual([
      { type: "note.attachment.set", noteId: toNoteId("note:0"), attachedToClassId: null },
    ]);
    expect(toNoteDuplicateTransaction(view)).toEqual([
      { type: "note.duplicate", noteId: toNoteId("note:0") },
    ]);
    expect(toNoteDeleteTransaction(view)).toEqual([
      { type: "note.delete", noteId: toNoteId("note:0") },
    ]);
  });
});
