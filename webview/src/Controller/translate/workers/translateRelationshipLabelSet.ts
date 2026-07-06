/**
 * @fileoverview Translates relationship label changes into write intents.
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
