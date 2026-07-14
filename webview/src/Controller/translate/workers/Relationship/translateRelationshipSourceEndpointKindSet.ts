/**
 * @fileoverview Translates relationship source marker changes into write intents.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { WriteIntent } from "../../writeIntent";
import { replaceRelationshipOperator } from "./relationshipEditSyntax";

export function translateRelationshipSourceEndpointKindSet(
  command: EditorCommandOf<"relationship.source.endpointKind.set">,
  graph: DiagramGraph
): WriteIntent[] {
  return replaceRelationshipOperator(command.relationshipId, graph, {
    sourceEndpointKind: command.endpointKind,
  });
}
