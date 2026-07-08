import { describe, expect, it } from "vitest";
import { composeNoteId } from "./noteIdentity";

describe("composeNoteId", () => {
  it("composes session note ids from document-order ordinals", () => {
    expect(composeNoteId(0)).toBe("note:0");
    expect(composeNoteId(12)).toBe("note:12");
  });
});
