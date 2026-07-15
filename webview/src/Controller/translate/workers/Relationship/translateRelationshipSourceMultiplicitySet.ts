/**
 * @fileoverview Translates relationship source multiplicity changes into write intents.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { WriteIntent } from "../../writeIntent";
import { replaceRelationshipMultiplicity } from "./relationshipEditSyntax";

/**
 * Makes one of three write options:
 *
 * a. source multiplicity already written and new multiplicity non-null → multiplicity
 *    **value**
 *    - in place
 * b. source multiplicity absent and new multiplicity non-null → source multiplicity **clause**
 *    - after the source endpoint
 * c. otherwise → source multiplicity **clause** deleted
 *
 * No-op when the relationship is missing or the source multiplicity is unchanged.
 */
export function translateRelationshipSourceMultiplicitySet(
  command: EditorCommandOf<"relationship.source.multiplicity.set">,
  graph: DiagramGraph
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  const existing = relationship.source.multiplicity;
  if (existing === command.multiplicity) return [];
  if (existing !== null && command.multiplicity !== null) {
    return replaceRelationshipMultiplicity(command.relationshipId, "source", command.multiplicity);
  }
  if (command.multiplicity !== null) {
    const clause = {
      kind: "relationshipSourceMultiplicity" as const,
      relationshipId: command.relationshipId,
    };
    return [
      {
        kind: "insertClause",
        payload: `"${command.multiplicity}"`,
        anchor: {
          kind: "afterComponent",
          clause,
          component: {
            kind: "relationshipEndpoint",
            relationshipId: command.relationshipId,
            side: "source",
          },
        },
      },
    ];
  }
  return [
    {
      kind: "deleteClause",
      target: { kind: "relationshipSourceMultiplicity", relationshipId: command.relationshipId },
    },
  ];
}
