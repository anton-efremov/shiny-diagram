/**
 * @fileoverview Translates `note.spatial.set`.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { WriteIntent } from "../../writeIntent";

/**
 * Makes four writes:
 *
 * 1. spatial coordinate **value** for x
 *    - in place
 * 2. spatial coordinate **value** for y
 *    - in place
 * 3. spatial coordinate **value** for w
 *    - in place
 * 4. spatial coordinate **value** for h
 *    - in place
 */
export function translateNoteSpatialSet(
  command: EditorCommandOf<"note.spatial.set">
): WriteIntent[] {
  return [
    { coord: "x" as const, value: Math.round(command.spatial.position.x) },
    { coord: "y" as const, value: Math.round(command.spatial.position.y) },
    { coord: "w" as const, value: command.spatial.size.width },
    { coord: "h" as const, value: command.spatial.size.height },
  ].map(({ coord, value }) => ({
    kind: "replaceValue",
    target: { kind: "noteSpatialCoord", noteId: command.noteId, coord },
    payload: String(value),
  }));
}
