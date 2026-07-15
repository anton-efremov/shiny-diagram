/**
 * @fileoverview Translates relationship target multiplicity changes into write intents.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { WriteIntent } from "../../writeIntent";
import { replaceRelationshipMultiplicity } from "./relationshipEditSyntax";

/**
 * Makes one of three write options:
 *
 * a. target multiplicity already written and new multiplicity non-null → multiplicity
 *    **value**
 *    - in place
 * b. target multiplicity absent and new multiplicity non-null → target multiplicity **clause**
 *    - after the relationship operator
 * c. otherwise → target multiplicity **clause** deleted
 *
 * No-op when the relationship is missing or the target multiplicity is unchanged.
 */
export function translateRelationshipTargetMultiplicitySet(
  command: EditorCommandOf<"relationship.target.multiplicity.set">,
  graph: DiagramGraph
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  const existing = relationship.target.multiplicity;
  if (existing === command.multiplicity) return [];
  if (existing !== null && command.multiplicity !== null) {
    return replaceRelationshipMultiplicity(command.relationshipId, "target", command.multiplicity);
  }
  if (command.multiplicity !== null) {
    const clause = {
      kind: "relationshipTargetMultiplicity" as const,
      relationshipId: command.relationshipId,
    };
    return [
      {
        kind: "insertClause",
        payload: `"${command.multiplicity}"`,
        anchor: {
          kind: "afterComponent",
          clause,
          component: { kind: "relationshipOperator", relationshipId: command.relationshipId },
        },
      },
    ];
  }
  return [
    {
      kind: "deleteClause",
      target: { kind: "relationshipTargetMultiplicity", relationshipId: command.relationshipId },
    },
  ];
}
