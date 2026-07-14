/**
 * @fileoverview Translates relationship target marker changes into write intents.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { WriteIntent } from "../../writeIntent";
import { replaceRelationshipOperator } from "./relationshipEditSyntax";

/**
 * Makes one write:
 *
 * 1. relationship operator **value**
 *    - in place
 *
 * No-op when the relationship is missing.
 */
export function translateRelationshipTargetEndpointKindSet(
  command: EditorCommandOf<"relationship.target.endpointKind.set">,
  graph: DiagramGraph
): WriteIntent[] {
  return replaceRelationshipOperator(command.relationshipId, graph, {
    targetEndpointKind: command.endpointKind,
  });
}
