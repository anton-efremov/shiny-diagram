/**
 * @fileoverview Translates relationship target marker changes into write intents.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { WriteIntent } from "../writeIntent";
import { replaceRelationshipOperator } from "./relationshipEditSyntax";

export function translateRelationshipTargetEndpointKindSet(
  command: EditorCommandOf<"relationship.target.endpointKind.set">,
  graph: DiagramGraph
): WriteIntent[] {
  return replaceRelationshipOperator(command.relationshipId, graph, {
    targetEndpointKind: command.endpointKind,
  });
}
