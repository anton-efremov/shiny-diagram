/**
 * @fileoverview Translates relationship target class changes into write intents.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { WriteIntent } from "../writeIntent";

export function translateRelationshipTargetClassSet(
  command: EditorCommandOf<"relationship.target.class.set">
): WriteIntent[] {
  return [
    {
      kind: "replaceValue",
      target: {
        kind: "relationshipEndpoint",
        relationshipId: command.relationshipId,
        side: "target",
      },
      payload: command.classId,
    },
  ];
}
