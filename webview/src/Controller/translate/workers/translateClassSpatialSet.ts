/**
 * @fileoverview Translates `class.spatial.set`.
 *
 * Emits write intents depending on existence of spatial annotations for requested class:
 *
 * a. Two write intents if spatial annotation exists
 * 
 *   1. DeleteStatementIntent for existing annotation line
 * 
 *   2. InsertStatementIntent for newly constructing annotation line
 *     - Written at position of deleted annotation line
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
import type { WriteIntent } from "../writeIntent";
import { anchorStatement } from "../anchors/anchorStatement";
import { composeSpatialAnnotation } from "../syntax/spatialSyntax";

export function translateClassSpatialSet(
  command: EditorCommandOf<"class.spatial.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
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

    return [
      {
        kind: "insertStatement",
        payload: composeSpatialAnnotation(command.classId, command.spatial),
        anchor: anchorStatement(graph, provenance, { kind: "diagram" }, [
          "classSpatial",
          "namespaceSpatial",
        ]),
      },
    ];
  }

  return provenance.classSpatial.has(command.classId)
    ? [{ kind: "deleteStatement", target: { kind: "classSpatial", classId: command.classId } }]
    : [];
}
