/**
 * @fileoverview Translates relationship source multiplicity changes into write intents.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { WriteIntent } from "../writeIntent";
import { replaceRelationshipMultiplicity, rewriteRelationship } from "./relationshipEditSyntax";

export function translateRelationshipSourceMultiplicitySet(
  command: EditorCommandOf<"relationship.source.multiplicity.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  const existing = relationship.source.multiplicity;
  if (existing === command.multiplicity) return [];
  if (existing !== null && command.multiplicity !== null) {
    return replaceRelationshipMultiplicity(command.relationshipId, "source", command.multiplicity);
  }
  return rewriteRelationship(command.relationshipId, graph, provenance, {
    sourceMultiplicity: command.multiplicity,
  });
}
