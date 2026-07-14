/**
 * @fileoverview Translates relationship line-kind changes into write intents.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { WriteIntent } from "../../writeIntent";
import { replaceRelationshipOperator } from "./relationshipEditSyntax";

export function translateRelationshipLineKindSet(
  command: EditorCommandOf<"relationship.lineKind.set">,
  graph: DiagramGraph
): WriteIntent[] {
  return replaceRelationshipOperator(command.relationshipId, graph, { lineKind: command.lineKind });
}
