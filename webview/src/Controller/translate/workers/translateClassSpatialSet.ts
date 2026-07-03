/**
 * @fileoverview Translates class.spatial.set: replace coordinate values, insert a new annotation, or delete the annotation.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { WriteIntent } from "../writeIntent";
import { anchorAfterLastStatement } from "../anchors";
import { composeSpatialAnnotation } from "../syntax/spatialSyntax";

export function translateClassSpatialSet(
  command: EditorCommandOf<"class.spatial.set">,
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
        anchor: anchorAfterLastStatement(provenance, { kind: "diagram" }),
      },
    ];
  }

  return provenance.classSpatial.has(command.classId)
    ? [{ kind: "deleteStatement", target: { kind: "classSpatial", classId: command.classId } }]
    : [];
}
