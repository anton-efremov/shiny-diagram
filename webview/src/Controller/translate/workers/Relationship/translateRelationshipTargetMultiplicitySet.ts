/**
 * @fileoverview Translates relationship target multiplicity changes into write intents.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import type { WriteIntent } from "../../writeIntent";
import { replaceRelationshipMultiplicity, rewriteRelationship } from "./relationshipEditSyntax";

/**
 * Makes one of two write options:
 *
 * a. target multiplicity already written and new multiplicity non-null → multiplicity
 *    **value**
 *    - in place
 * b. otherwise → Makes two writes:
 *    1. old relationship **statement** deleted
 *    2. new relationship **statement**
 *       - at the old location
 *
 * No-op when the relationship is missing or the target multiplicity is unchanged.
 */
export function translateRelationshipTargetMultiplicitySet(
  command: EditorCommandOf<"relationship.target.multiplicity.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const relationship = graph.relationships.get(command.relationshipId);
  if (!relationship) return [];
  const existing = relationship.target.multiplicity;
  if (existing === command.multiplicity) return [];
  if (existing !== null && command.multiplicity !== null) {
    return replaceRelationshipMultiplicity(command.relationshipId, "target", command.multiplicity);
  }
  return rewriteRelationship(command.relationshipId, graph, provenance, {
    targetMultiplicity: command.multiplicity,
  });
}
