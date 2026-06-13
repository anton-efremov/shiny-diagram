/**
 * @fileoverview Builds SpatialData values from Shiny spatial annotation tokens.
 */

import type { SourceLocation, SpatialData } from "../../../models/classDiagram/diagramTreeModel";
import type { ClassId } from "../../../models/classDiagram/primitives";
import { toClassId } from "../../../models/classDiagram/primitives";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "./toSourceLocation";

export type SpatialEntry = {
  readonly classId: ClassId;
  readonly spatial: SpatialData;
};

/** A @spatial line whose classId was recognised but whose values are incomplete. */
export type MalformedAnnotation = {
  readonly classId: ClassId;
  readonly location: SourceLocation;
};

/**
 * Builds spatial data from a spatialAnnotation token.
 */
export function buildSpatialData(token: ParseToken): SpatialEntry | MalformedAnnotation | null {
  if (token.type !== "spatialAnnotation") return null;

  const match = /^\s*%%\s+@spatial:([A-Za-z_]\w*)\s*(.*)$/.exec(token.raw);
  if (!match) return null;

  const classId = toClassId(match[1]);
  const location = toSourceLocation(token);
  const values = parseSpatialValues(match[2]);
  if (!values) {
    return { classId, location };
  }

  return {
    classId,
    spatial: {
      x: values.x,
      y: values.y,
      width: values.width,
      height: values.height,
      location,
    },
  };
}

type SpatialValues = { x: number; y: number; width: number; height: number };

/**
 * Parses a spatial annotation value string into numeric x, y, width, height.
 * Returns null if any required key is missing or its value is not a finite number.
 */
function parseSpatialValues(valueText: string): SpatialValues | null {
  const values = new Map<string, number>();

  for (const part of valueText.trim().split(/\s+/)) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx);
    const value = Number(part.slice(eqIdx + 1));
    if (key && Number.isFinite(value)) {
      values.set(key, value);
    }
  }

  const x = values.get("x");
  const y = values.get("y");
  const width = values.get("w");
  const height = values.get("h");

  if (x === undefined || y === undefined || width === undefined || height === undefined) {
    return null;
  }

  return { x, y, width, height };
}
