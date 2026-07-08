import { describe, expect, it } from "vitest";
import { toNoteCreateTransaction } from "./transactions";

describe("PlacementOverlay note transactions", () => {
  it("builds note creation with default size and empty attachment", () => {
    expect(toNoteCreateTransaction({ x: 30, y: 40 })).toEqual([
      {
        type: "note.create",
        text: " ",
        spatial: { position: { x: 30, y: 40 }, size: { width: 180, height: 96 } },
        attachedToClassId: null,
      },
    ]);
  });
});
