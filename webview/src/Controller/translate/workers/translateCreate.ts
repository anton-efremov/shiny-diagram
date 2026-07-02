/**
 * @fileoverview Translates class create and duplicate commands.
 */

import type { EditorCommandOf } from "../../../View/commands";
import type { DiagramGraph } from "../../model/diagramGraph";
import type { ProvenanceIndex } from "../../model/provenanceIndex";
import type { StatementAnchor, StatementRef, WriteIntent } from "../writeIntent";
import {
  composeClassDeclaration,
  composeClassStyleApplication,
  composeDuplicatedClassDeclaration,
  composeSpatialAnnotation,
  composeSpatialAnnotationParts,
} from "../composeFragment";
import { allocateClassId, generateDuplicateClassId } from "../generateId";

export function translateCreate(
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
      anchor: chooseSpatialAnchor(provenance),
    },
  ];
}

export function translateDuplicate(
  command: EditorCommandOf<"class.duplicate">,
  graph: DiagramGraph
): WriteIntent[] {
  const source = graph.classes.get(command.sourceClassId);
  if (!source) throw new Error(`Class ${command.sourceClassId} cannot be duplicated`);
  if (!source.spatial) throw new Error(`Class ${command.sourceClassId} has no spatial data`);

  const id = generateDuplicateClassId(graph, command.sourceClassId);
  const intents: WriteIntent[] = [
    {
      kind: "insertStatement",
      payload: composeDuplicatedClassDeclaration(source, id),
      anchor: {
        kind: "afterStatement",
        statement: { kind: "class", classId: command.sourceClassId },
      },
    },
    {
      kind: "insertStatement",
      payload: composeSpatialAnnotationParts(id, command.position, source.spatial.size),
      anchor: {
        kind: "afterStatement",
        statement: { kind: "class", classId: command.sourceClassId },
      },
    },
  ];

  const style = [...graph.styleApplications.values()].find(
    (candidate) => candidate.targetId === command.sourceClassId
  );
  if (style) {
    intents.push({
      kind: "insertStatement",
      payload: composeClassStyleApplication(id, style.styleDefId),
      anchor: {
        kind: "afterStatement",
        statement: { kind: "class", classId: command.sourceClassId },
      },
    });
  }

  return intents;
}

function chooseSpatialAnchor(provenance: ProvenanceIndex): StatementAnchor {
  const lastSpatial = [...provenance.classSpatial.entries()].sort(
    (left, right) => left[1].self.startLine - right[1].self.startLine
  )[provenance.classSpatial.size - 1];
  if (lastSpatial) {
    return { kind: "afterStatement", statement: { kind: "classSpatial", classId: lastSpatial[0] } };
  }

  const lastStatement = [
    ...[...provenance.classes.keys()].map((classId) => ({ kind: "class" as const, classId })),
    ...[...provenance.relationships.keys()].map((relationshipId) => ({
      kind: "relationship" as const,
      relationshipId,
    })),
    ...[...provenance.classDirectStyles.keys()].map((classId) => ({
      kind: "classDirectStyle" as const,
      classId,
    })),
    ...[...provenance.styleApplications.keys()].map((styleApplicationId) => ({
      kind: "styleApplication" as const,
      styleApplicationId,
    })),
  ].sort((left, right) => {
    const leftLocation = resolveStatementLine(left, provenance);
    const rightLocation = resolveStatementLine(right, provenance);
    return leftLocation - rightLocation;
  });

  const anchor = lastStatement[lastStatement.length - 1];
  return anchor
    ? { kind: "afterStatement", statement: anchor }
    : { kind: "afterBlockOpening", block: { kind: "diagram" } };
}

function resolveStatementLine(
  ref: Extract<
    StatementRef,
    | { readonly kind: "class" }
    | { readonly kind: "relationship" }
    | { readonly kind: "classDirectStyle" }
    | { readonly kind: "styleApplication" }
  >,
  provenance: ProvenanceIndex
): number {
  switch (ref.kind) {
    case "class":
      return provenance.classes.get(ref.classId)?.self.startLine ?? -1;
    case "relationship":
      return provenance.relationships.get(ref.relationshipId)?.self.startLine ?? -1;
    case "classDirectStyle":
      return provenance.classDirectStyles.get(ref.classId)?.self.startLine ?? -1;
    case "styleApplication":
      return provenance.styleApplications.get(ref.styleApplicationId)?.self.startLine ?? -1;
  }
}
