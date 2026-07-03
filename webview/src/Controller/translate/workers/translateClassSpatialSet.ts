/**
 * @fileoverview Translates `class.spatial.set`.
 *
 * Emits write intents depending on existence of spatial annotations for requested class:
 *
 * a. Four ReplaceValueIntent's for each value in spatial annotation
 *
 * b. InsertStatementIntent if spatial annotation is missing
 *   - Written after the latest class spatial annotation in the target scope.
 *   - If no class spatial annotations - after latest statement of any kind.
 *
 * NOTE - CODE IS NOT ALIGNED WITH DESCRIPTION YET
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { BlockRef, StatementAnchor, WriteIntent } from "../writeIntent";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../anchors/statementAnchors";
import { composeSpatialAnnotation } from "../syntax/spatialSyntax";

export function translateClassSpatialSet(
  command: EditorCommandOf<"class.spatial.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const diagramScope: BlockRef = { kind: "diagram" };

  if (command.spatial) {
    if (provenance.classSpatial.has(command.classId)) {
      return [
        { coord: "x" as const, value: Math.round(command.spatial.position.x) },
        { coord: "y" as const, value: Math.round(command.spatial.position.y) },
        { coord: "w" as const, value: command.spatial.size.width },
        { coord: "h" as const, value: command.spatial.size.height },
      ].map(({ coord, value }) => ({
        kind: "replaceValue",
        target: {
          kind: "spatialCoord",
          target: { kind: "class", classId: command.classId },
          coord,
        },
        payload: String(value),
      }));
    }

    const anchor: StatementAnchor =
      asSameKind(anchorAfterKindList(graph, provenance, diagramScope, ["classSpatial"])) ??
      asDifferentKind(anchorAfterKindList(graph, provenance, diagramScope, STATEMENT_KINDS)) ??
      anchorBlockOpening(diagramScope);
    const insertSpatialIntent: WriteIntent = {
      kind: "insertStatement",
      payload: composeSpatialAnnotation(command.classId, command.spatial),
      anchor,
    };

    return [insertSpatialIntent];
  }

  return provenance.classSpatial.has(command.classId)
    ? [{ kind: "deleteStatement", target: { kind: "classSpatial", classId: command.classId } }]
    : [];
}
