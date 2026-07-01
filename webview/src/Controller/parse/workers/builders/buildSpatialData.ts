/**
 * @fileoverview Builds valid or malformed spatial data from annotation tokens.
 */

import { toClassId, type ClassId } from "../../../../shared/ids";
import type { SpatialAttachment } from "../../../../shared/geometry";
import type { SourceLocation } from "../../../model/sourceLocation";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "../toSourceLocation";

export type SpatialEntry = {
  readonly classId: ClassId;
  readonly spatial: SpatialAttachment;
  readonly location: SourceLocation;
};
export type MalformedAnnotation = { readonly classId: ClassId; readonly location: SourceLocation };

/**
 * Builds valid spatial data or a malformed annotation record.
 */
export function buildSpatialData(token: ParseToken): SpatialEntry | MalformedAnnotation | null {
  if (token.type !== "spatialAnnotation") return null;

  const match = /^\s*%%\s+@spatial:([A-Za-z_]\w*)\s*(.*)$/.exec(token.raw);
  if (!match) return null;

  const classId = toClassId(match[1]);
  const location = toSourceLocation(token);
  const values = parseSpatialValues(match[2]);
  if (!values) return { classId, location };

  return {
    classId,
    location,
    spatial: {
      position: { x: values.x, y: values.y },
      size: { width: values.width, height: values.height },
    },
  };
}

type SpatialValues = { x: number; y: number; width: number; height: number };

function parseSpatialValues(valueText: string): SpatialValues | null {
  const values = new Map<string, number>();

  for (const part of valueText.trim().split(/\s+/)) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx);
    const value = Number(part.slice(eqIdx + 1));
    if (key && Number.isFinite(value)) values.set(key, value);
  }

  const x = values.get("x");
  const y = values.get("y");
  const width = values.get("w");
  const height = values.get("h");

  if (x === undefined || y === undefined || width === undefined || height === undefined)
    return null;

  return { x, y, width, height };
}
