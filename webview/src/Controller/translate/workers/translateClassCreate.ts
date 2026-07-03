/**
 * @fileoverview Translates `class.create`.
 *
 * Emits class creation as two logical statement insertions.
 *
 * 1. Class declaration statement
 * - Written inside the requested parent namespace if `parentNamespaceId` is set
 * or diagram scope otherwise
 * - Written after the latest class statement in the target scope.
 * - If no class statements in the target scope - after the latest namespace statement
 * - Otherwise, in the beginning of scope block
 *
 * 2. Spatial annotation
 * - Written after the latest class spatial annotation in the target scope.
 * - If no class spatial annotations - after latest statement of any kind.
 *
 * NOTE - CODE IS NOT ALIGNED WITH DESCRIPTION YET
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { ClassId } from "../../../shared/ids";
import type { WriteIntent } from "../writeIntent";
import { anchorStatement } from "../anchors/anchorStatement";
import { allocateClassId } from "../generateId";
import { composeSpatialAnnotation } from "../syntax/spatialSyntax";

export function translateClassCreate(
  command: EditorCommandOf<"class.create">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const id = allocateClassId(null, graph);
  return [
    {
      kind: "insertStatement",
      payload: composeClassDeclaration(id),
      anchor: { kind: "afterBlockOpening", block: { kind: "diagram" } },
    },
    {
      kind: "insertStatement",
      payload: composeSpatialAnnotation(id, command.spatial),
      anchor: anchorStatement(graph, provenance, { kind: "diagram" }, [
        "classSpatial",
        "namespaceSpatial",
      ]),
    },
  ];
}

function composeClassDeclaration(classId: ClassId): string {
  return `class ${classId}`;
}
