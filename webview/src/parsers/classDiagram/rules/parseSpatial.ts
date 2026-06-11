/**
 * @fileoverview Extracts Shiny spatial annotations from tokenized Mermaid source.
 * Produces SpatialAnnotation values with SourceLocation so the diff patcher can
 * update x/y on drag without re-parsing the whole file.
 */

import type { SpatialAnnotation } from "../diagramModel";
import type { TokenizedLine } from "../tokenizer";

/**
 * Extracts all @spatial annotations from the tokenized source.
 * Lines without all four required keys (x, y, w, h) are silently skipped.
 *
 * @param lines - Flat tokenized line sequence from the tokenizer.
 * @returns Array of parsed spatial annotations with source locations.
 */
export function parseSpatial(lines: TokenizedLine[]): SpatialAnnotation[] {
  const result: SpatialAnnotation[] = [];
  const pattern = /^\s*%%\s+@spatial:([A-Za-z_]\w*)\s+(.+)$/;

  for (const line of lines) {
    if (line.type !== "spatialAnnotation") continue;

    const match = pattern.exec(line.raw);
    if (!match) continue;

    const classId = match[1];
    const values = parseSpatialValues(match[2]);
    if (!values) continue;

    result.push({
      classId,
      x: values.x,
      y: values.y,
      width: values.width,
      height: values.height,
      location: { line: line.lineNumber, raw: line.raw },
    });
  }

  return result;
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
