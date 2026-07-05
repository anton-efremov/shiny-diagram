/**
 * @fileoverview Translates `class.delete`.
 *
 * Emits deletion of every explicit source statement owned by or attached to the
 * deleted class (in case they exist)
 *
 * 1. Class declaration block (incl. members)
 *
 * 2. Spatial annotation
 *
 * 3. Relationships (where the source class is either the source endpoint or the target endpoint).
 *
 * 4. Direct style statements
 *
 * 5. Style application statements
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { WriteIntent } from "../writeIntent";

export function translateClassDelete(
  command: EditorCommandOf<"class.delete">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const classId = command.classId;
  const intents: WriteIntent[] = [];

  if (provenance.classes.has(classId)) {
    intents.push({ kind: "deleteStatement", target: { kind: "class", classId } });
  }
  if (provenance.classSpatial.has(classId)) {
    intents.push({ kind: "deleteStatement", target: { kind: "classSpatial", classId } });
  }
  for (const relationship of graph.relationships.values()) {
    if (
      (relationship.source.classId === classId || relationship.target.classId === classId) &&
      provenance.relationships.has(relationship.id)
    ) {
      intents.push({
        kind: "deleteStatement",
        target: { kind: "relationship", relationshipId: relationship.id },
      });
    }
  }
  if (provenance.classDirectStyles.has(classId)) {
    intents.push({ kind: "deleteStatement", target: { kind: "classDirectStyle", classId } });
  }
  for (const styleApplication of graph.styleApplications.values()) {
    if (
      styleApplication.targetId === classId &&
      provenance.styleApplications.has(styleApplication.id)
    ) {
      intents.push({
        kind: "deleteStatement",
        target: { kind: "styleApplication", styleApplicationId: styleApplication.id },
      });
    }
  }

  return intents;
}
