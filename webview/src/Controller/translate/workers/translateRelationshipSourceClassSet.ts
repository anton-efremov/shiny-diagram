/**
 * @fileoverview Translates relationship source class changes into write intents.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import { composeRelationshipId } from "../../model/relationshipIdentity";
import type { TranslateContext } from "../translateContext";
import type { WriteIntent } from "../writeIntent";

export function translateRelationshipSourceClassSet(
  command: EditorCommandOf<"relationship.source.class.set">,
  graph: DiagramGraph,
  context: TranslateContext
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (relationship) {
    context.recordRelationshipRenamed(
      command.relationshipId,
      composeRelationshipId(command.classId, relationship.target.classId, relationship.ordinal)
    );
  }

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
