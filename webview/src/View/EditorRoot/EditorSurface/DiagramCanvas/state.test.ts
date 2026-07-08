import { describe, expect, it } from "vitest";
import { toNoteId } from "../../../../shared/ids";
import { toInitialNoteBoxPlacementState } from "./state";

describe("toInitialNoteBoxPlacementState", () => {
  it("uses source bounds when present and stacks unannotated notes deterministically", () => {
    const state = toInitialNoteBoxPlacementState([
      {
        noteId: toNoteId("note:0"),
        text: "Annotated",
        bounds: { x: 10, y: 20, w: 120, h: 80 },
        attachedToClassId: null,
      },
      {
        noteId: toNoteId("note:1"),
        text: "Bare",
        bounds: null,
        attachedToClassId: null,
      },
    ]);

    expect(state.rectByNoteId.get(toNoteId("note:0"))).toEqual({ x: 10, y: 20, w: 120, h: 80 });
    expect(state.rectByNoteId.get(toNoteId("note:1"))).toEqual({ x: 48, y: 162, w: 180, h: 96 });
  });
});
