/**
 * @fileoverview Translates relationship target class changes into write intents.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import { spellIdentity } from "../../model/identitySpelling";
import { composeRelationshipId } from "../../model/relationshipIdentity";
import type { TranslateContext } from "../translateContext";
import type { WriteIntent } from "../writeIntent";

export function translateRelationshipTargetClassSet(
  command: EditorCommandOf<"relationship.target.class.set">,
  graph: DiagramGraph,
  context: TranslateContext
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (relationship) {
    context.recordRelationshipRenamed(
      command.relationshipId,
      composeRelationshipId(relationship.source.classId, command.classId, relationship.ordinal)
    );
  }

  return [
    {
      kind: "replaceValue",
      target: {
        kind: "relationshipEndpoint",
        relationshipId: command.relationshipId,
        side: "target",
      },
      payload: spellIdentity(command.classId),
    },
  ];
}
