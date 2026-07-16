import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { WriteIntent } from "../../writeIntent";

/**
 * Makes one of three write options:
 *
 * a. label already written and new label non-null → relationship label **value**
 *    - in place
 * b. label absent and new label non-null → relationship label **clause**
 *    - after the target endpoint
 * c. otherwise → relationship label **clause** deleted
 *
 * No-op when the relationship is missing or the label is unchanged.
 */
export function translateRelationshipLabelSet(
  command: EditorCommandOf<"relationship.label.set">,
  graph: DiagramGraph
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  if (relationship.label === command.label) return [];
  if (relationship.label !== null && command.label !== null) {
    return [
      {
        kind: "replaceValue",
        target: { kind: "relationshipLabel", relationshipId: command.relationshipId },
        payload: command.label,
      },
    ];
  }
  if (command.label !== null) {
    const clause = { kind: "relationshipLabel" as const, relationshipId: command.relationshipId };
    return [
      {
        kind: "insertClause",
        payload: command.label,
        anchor: {
          kind: "afterComponent",
          clause,
          component: {
            kind: "relationshipEndpoint",
            relationshipId: command.relationshipId,
            side: "target",
          },
        },
      },
    ];
  }
  return [
    {
      kind: "deleteClause",
      target: { kind: "relationshipLabel", relationshipId: command.relationshipId },
    },
  ];
}
