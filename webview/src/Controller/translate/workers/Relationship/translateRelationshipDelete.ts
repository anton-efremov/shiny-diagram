/**
 * @fileoverview Translates relationship deletion into write intents.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { WriteIntent } from "../../writeIntent";

/**
 * Makes one write:
 *
 * 1. relationship **statement** deleted
 */
export function translateRelationshipDelete(
  command: EditorCommandOf<"relationship.delete">
): WriteIntent[] {
  return [
    {
      kind: "deleteStatement",
      target: { kind: "relationship", relationshipId: command.relationshipId },
    },
  ];
}
