import { describe, expect, it } from "vitest";
import { toNoteId } from "../../../../../../../shared/ids";
import { toNoteDeleteTransaction, toNoteTextCommitTransaction } from "./transactions";

describe("NoteBox transactions", () => {
  it("builds text commit, empty commit delete, and delete transactions", () => {
    const noteId = toNoteId("note:0");

    expect(toNoteTextCommitTransaction(noteId, "Updated")).toEqual([
      { type: "note.text.set", noteId, text: "Updated" },
    ]);
    expect(toNoteTextCommitTransaction(noteId, "")).toEqual([{ type: "note.delete", noteId }]);
    expect(toNoteDeleteTransaction(noteId)).toEqual([{ type: "note.delete", noteId }]);
  });
});
