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
