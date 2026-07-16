/**
 * @fileoverview Translates batched relationship operator changes into one write intent.
 */

import type { RelationshipId } from "../../../../shared/ids";
import type { RelationshipEndpointKind, RelationshipLineKind } from "../../../../shared/uml";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { WriteIntent } from "../../writeIntent";
import { replaceRelationshipOperator } from "./relationshipEditSyntax";

export function translateRelationshipOperatorPatch(
  relationshipId: RelationshipId,
  graph: DiagramGraph,
  patch: Partial<{
    readonly sourceEndpointKind: RelationshipEndpointKind;
    readonly targetEndpointKind: RelationshipEndpointKind;
    readonly lineKind: RelationshipLineKind;
  }>
): WriteIntent[] {
  return replaceRelationshipOperator(relationshipId, graph, patch);
}
