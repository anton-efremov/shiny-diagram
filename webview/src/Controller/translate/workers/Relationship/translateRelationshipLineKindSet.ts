/**
 * @fileoverview Translates relationship line-kind changes into write intents.
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
export function translateRelationshipLineKindSet(
  command: EditorCommandOf<"relationship.lineKind.set">,
  graph: DiagramGraph
): WriteIntent[] {
  return replaceRelationshipOperator(command.relationshipId, graph, { lineKind: command.lineKind });
}
