/**
 * @fileoverview Translates class.create: insert a new class declaration and spatial annotation.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { ClassId } from "../../../shared/ids";
import type { WriteIntent } from "../writeIntent";
import { anchorAfterLastStatement } from "../anchors";
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
      anchor: anchorAfterLastStatement(provenance, { kind: "diagram" }),
    },
  ];
}

function composeClassDeclaration(classId: ClassId): string {
  return `class ${classId}`;
}
