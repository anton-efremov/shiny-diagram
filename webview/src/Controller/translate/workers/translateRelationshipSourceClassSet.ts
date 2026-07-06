/**
 * @fileoverview Translates relationship source class changes into write intents.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { WriteIntent } from "../writeIntent";

export function translateRelationshipSourceClassSet(
  command: EditorCommandOf<"relationship.source.class.set">
): WriteIntent[] {
  return [
    {
      kind: "replaceValue",
      target: {
        kind: "relationshipEndpoint",
        relationshipId: command.relationshipId,
        side: "source",
      },
      payload: command.classId,
    },
  ];
}
