/**
 * Makes one of two write options:
 *
 * a. label already written and new label non-null → label **value**
 *    - in place
 * 
 * b. otherwise → two writes
 *    1. old relationship **statement** deleted
 *    2. new relationship **statement** 
 *    - at the old location
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { WriteIntent } from "../writeIntent";
import { rewriteRelationship } from "./relationshipEditSyntax";

export function translateRelationshipLabelSet(
  command: EditorCommandOf<"relationship.label.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
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
  return rewriteRelationship(command.relationshipId, graph, provenance, { label: command.label });
}
