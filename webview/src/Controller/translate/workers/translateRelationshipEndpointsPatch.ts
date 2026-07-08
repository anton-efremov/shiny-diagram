/**
 * @fileoverview Translates a batched rewrite of both endpoint classes of one
 * relationship (the reverse journey) into write intents.
 *
 * When one transaction sets both the source and the target class of the same
 * relationship, the two commands describe one identity change. This worker
 * records that rename once with both endpoints applied and the ordinal
 * preserved; the individual source/target commands absorbed into the batch must
 * not also record — double-recording is a defect.
 */

import type { ClassId, RelationshipId } from "../../../shared/ids";
import type { DiagramGraph } from "../../model/diagramGraph";
import { composeRelationshipId } from "../../model/relationshipIdentity";
import { spellIdentity } from "../../model/identitySpelling";
import type { TranslateContext } from "../translateContext";
import type { WriteIntent } from "../writeIntent";

export function translateRelationshipEndpointsPatch(
  relationshipId: RelationshipId,
  graph: DiagramGraph,
  patch: {
    readonly sourceClassId: ClassId;
    readonly targetClassId: ClassId;
  },
  context: TranslateContext
): WriteIntent[] {
  const relationship = graph.relationships.get(relationshipId);
  if (relationship) {
    context.recordRelationshipRenamed(
      relationshipId,
      composeRelationshipId(patch.sourceClassId, patch.targetClassId, relationship.ordinal)
    );
  }

  return [
    {
      kind: "replaceValue",
      target: { kind: "relationshipEndpoint", relationshipId, side: "source" },
      payload: spellIdentity(patch.sourceClassId),
    },
    {
      kind: "replaceValue",
      target: { kind: "relationshipEndpoint", relationshipId, side: "target" },
      payload: spellIdentity(patch.targetClassId),
    },
  ];
}
