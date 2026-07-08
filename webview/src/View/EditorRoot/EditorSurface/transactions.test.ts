import { describe, expect, it } from "vitest";
import { toClassId, toNoteId } from "../../../shared/ids";
import { toNoteAttachmentSetTransaction } from "./transactions";

describe("EditorSurface note transactions", () => {
  it("builds note attachment transactions", () => {
    expect(toNoteAttachmentSetTransaction(toNoteId("note:0"), toClassId("User"))).toEqual([
      {
        type: "note.attachment.set",
        noteId: toNoteId("note:0"),
        attachedToClassId: toClassId("User"),
      },
    ]);
  });
});
