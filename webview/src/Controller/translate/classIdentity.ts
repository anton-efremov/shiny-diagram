/**
 * @fileoverview Generates source identities for translated write intents.
 */

import type { DiagramGraph } from "../model/diagramGraph";
import type { ClassId } from "../../shared/ids";
import { toClassId } from "../../shared/ids";

const BASE_CLASS_ID = "NewClass";

export function allocateClassId(
  requestedName: string | null | undefined,
  graph: DiagramGraph
): ClassId {
  return generateClassId(graph, requestedName ?? BASE_CLASS_ID);
}

export function generateClassId(graph: DiagramGraph, preferredBase = BASE_CLASS_ID): ClassId {
  const base = sanitizeClassId(preferredBase) || BASE_CLASS_ID;
  if (!graph.classes.has(toClassId(base))) return toClassId(base);

  let suffix = 1;
  while (graph.classes.has(toClassId(`${base}${suffix}`))) {
    suffix++;
  }

  return toClassId(`${base}${suffix}`);
}

export function generateDuplicateClassId(
  graph: DiagramGraph,
  sourceClassId: ClassId,
  reservedClassIds: ReadonlySet<ClassId> = new Set()
): ClassId {
  const match = /^(.*)_(\d+)$/.exec(sourceClassId);
  const base = match ? match[1] : sourceClassId;
  let suffix = match ? Number(match[2]) + 1 : 1;

  while (isClassIdUnavailable(graph, reservedClassIds, toClassId(`${base}_${suffix}`))) {
    suffix++;
  }

  return toClassId(`${base}_${suffix}`);
}

function isClassIdUnavailable(
  graph: DiagramGraph,
  reservedClassIds: ReadonlySet<ClassId>,
  classId: ClassId
): boolean {
  return graph.classes.has(classId) || reservedClassIds.has(classId);
}

function sanitizeClassId(value: string): string {
  const sanitized = value.replace(/\W/g, "_").replace(/^_+/, "");
  return /^\d/.test(sanitized) ? `Class${sanitized}` : sanitized;
}
