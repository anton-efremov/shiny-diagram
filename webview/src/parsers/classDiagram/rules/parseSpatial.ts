/**
 * @fileoverview Extracts Shiny spatial annotations from tokenized Mermaid source.
 * Produces SpatialAnnotation values with SourceLocation so the diff patcher can
 * update x/y on drag without re-parsing the whole file.
 */

import type { SpatialAnnotation, SourceLocation } from "../diagramModel";
import type { TokenizedLine } from "../tokenizer";

/** A @spatial line whose classId was recognised but whose values are incomplete. */
export type MalformedAnnotation = {
  readonly classId: string;
  readonly location: SourceLocation;
};

/** Return value of parseSpatial — valid annotations and any incomplete ones. */
export type ParseSpatialResult = {
  readonly valid: SpatialAnnotation[];
  readonly malformed: MalformedAnnotation[];
};

/**
 * Extracts all @spatial annotations from the tokenized source.
 * Lines with a recognised classId but missing required keys (x, y, w, h)
 * are collected as malformed rather than silently discarded, so callers
 * can replace them instead of appending duplicates.
 *
 * @param lines - Flat tokenized line sequence from the tokenizer.
 * @returns Valid annotations and any incomplete ones with their source locations.
 */
export function parseSpatial(lines: TokenizedLine[]): ParseSpatialResult {
  const valid: SpatialAnnotation[] = [];
  const malformed: MalformedAnnotation[] = [];
  const pattern = /^\s*%%\s+@spatial:([A-Za-z_]\w*)\s*(.*)$/;

  const parseLine = (line: TokenizedLine): void => {
    if (line.type !== "spatialAnnotation") return;
    const match = pattern.exec(line.raw);
    if (!match) return;
    const classId = match[1];
    const location: SourceLocation = { line: line.lineNumber, raw: line.raw };
    const values = parseSpatialValues(match[2]);
    if (!values) {
      malformed.push({ classId, location });
      return;
    }
    valid.push({
      classId,
      x: values.x,
      y: values.y,
      width: values.width,
      height: values.height,
      location,
    });
  };

  for (const line of lines) {
    parseLine(line);
    // Annotations placed inside class body blocks (e.g. by a previous Generate
    // that used the class declaration line as insertion point) are captured here
    // so they are not treated as permanently missing.
    if (line.blockLines) {
      for (const blockLine of line.blockLines) {
        parseLine(blockLine);
      }
    }
  }

  return { valid, malformed };
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
