/**
 * @fileoverview Generates unique class identifiers for source edits.
 */

import type { DiagramTree } from "../../model/diagramTree";
import type { ClassId } from "../../../shared/ids";
import { toClassId } from "../../../shared/ids";

const BASE_CLASS_ID = "NewClass";

/**
 * Generates the first available default class identifier.
 */
export function generateClassId(model: DiagramTree): ClassId {
  if (!model.classes.has(toClassId(BASE_CLASS_ID))) {
    return toClassId(BASE_CLASS_ID);
  }

  let suffix = 1;
  while (model.classes.has(toClassId(`${BASE_CLASS_ID}${suffix}`))) {
    suffix++;
  }

  return toClassId(`${BASE_CLASS_ID}${suffix}`);
}

/**
 * Generates the first available duplicate identifier for a source class.
 */
export function generateDuplicateClassId(
  model: DiagramTree,
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
  model: DiagramTree,
  reservedClassIds: ReadonlySet<ClassId>,
  classId: ClassId
): boolean {
  return model.classes.has(classId) || reservedClassIds.has(classId);
}
