/**
 * @fileoverview Generates unique class identifiers for source edits.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { ClassId } from "../../../shared/ids";
import { toClassId } from "../../../shared/ids";

const BASE_CLASS_ID = "NewClass";

/**
 * Generates the first available default class identifier.
 */
export function generateClassId(model: DiagramGraph, preferredBase = BASE_CLASS_ID): ClassId {
  const base = sanitizeClassId(preferredBase) || BASE_CLASS_ID;
  if (!model.classes.has(toClassId(base))) {
    return toClassId(base);
  }

  let suffix = 1;
  while (model.classes.has(toClassId(`${base}${suffix}`))) {
    suffix++;
  }

  return toClassId(`${base}${suffix}`);
}

/**
 * Generates the first available duplicate identifier for a source class.
 */
export function generateDuplicateClassId(
  model: DiagramGraph,
  sourceClassId: ClassId,
  reservedClassIds: ReadonlySet<ClassId> = new Set()
): ClassId {
  const match = /^(.*)_(\d+)$/.exec(sourceClassId);
  const base = match ? match[1] : sourceClassId;
  let suffix = match ? Number(match[2]) + 1 : 1;

  while (isClassIdUnavailable(model, reservedClassIds, toClassId(`${base}_${suffix}`))) {
    suffix++;
  }

  return toClassId(`${base}_${suffix}`);
}

function isClassIdUnavailable(
  model: DiagramGraph,
  reservedClassIds: ReadonlySet<ClassId>,
  classId: ClassId
): boolean {
  return model.classes.has(classId) || reservedClassIds.has(classId);
}

function sanitizeClassId(value: string): string {
  const sanitized = value.replace(/\W/g, "_").replace(/^_+/, "");
  return /^\d/.test(sanitized) ? `Class${sanitized}` : sanitized;
}
