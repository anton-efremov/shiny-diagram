/** @fileoverview Translates `class.spatial.set`. */

import type { EditorCommandOf } from "../../../../View/commands";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import type { BlockRef, StatementAnchor, WriteIntent } from "../../writeIntent";
import {
  anchorAfterKindList,
  anchorBlockOpening,
  asDifferentKind,
  asSameKind,
  STATEMENT_KINDS,
} from "../../anchors/statementAnchors";
import { composeSpatialAnnotation } from "../../syntax/spatialSyntax";

/**
 * Makes one of three write options:
 *
 * a. spatial annotation already written and new spatial data non-null → Makes four writes:
 *    1. spatial coordinate **value** for x
 *       - in place
 *    2. spatial coordinate **value** for y
 *       - in place
 *    3. spatial coordinate **value** for w
 *       - in place
 *    4. spatial coordinate **value** for h
 *       - in place
 * b. spatial annotation absent and new spatial data non-null → spatial annotation
 *    **statement**, in **diagram body** (anchored at first match)
 *    - after the latest spatial annotation statement
 *    - after the latest statement of any kind
 *    - at block opening
 * c. otherwise → spatial annotation **statement** deleted
 *
 * No-op when the spatial annotation is absent and the new spatial data is null.
 */
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
