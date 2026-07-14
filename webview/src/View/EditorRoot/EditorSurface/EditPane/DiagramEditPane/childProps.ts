/**
 * @behavior Source-ordered document color and stroke-selector UI prop derivation for diagram style editing.
 */

import type { StyleView } from "../../../../views/schema";
import type { StylePropertyName } from "../../../../../shared/style";

type StrokeSelectUIProps = {
  readonly constantValue: string;
  readonly documentValues: readonly string[];
};

// UI props derivation
export function toDocumentColors(styles: readonly StyleView[]): readonly string[] {
  const colors: string[] = [];
  const normalized = new Set<string>();

  for (const style of styles) {
    for (const value of [style.properties.fill, style.properties.stroke, style.properties.color]) {
      if (value === null) continue;
      const key = normalizeColor(value);
      if (normalized.has(key)) continue;
      normalized.add(key);
      colors.push(value);
    }
  }

  return colors;
}

export function toStrokeSelectUIProps(
  styles: readonly StyleView[],
  property: Extract<StylePropertyName, "strokeWidth" | "strokeDasharray">,
  constantValue: string
): StrokeSelectUIProps {
  const seen = new Set<string>();
  const documentValues: string[] = [];

  for (const style of styles) {
    const value = style.properties[property];
    if (value === null) continue;
    const key = normalizeStrokeValue(property, value);
    if (seen.has(key)) continue;
    seen.add(key);
    documentValues.push(property === "strokeDasharray" && key === "0" ? "0" : value);
  }
  return { constantValue, documentValues };
}

// Private helpers
function normalizeColor(value: string): string {
  const normalized = value.trim().toLowerCase();
  const shortHex = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(normalized);
  return shortHex
    ? `#${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`
    : normalized;
}

function normalizeStrokeValue(
  property: Extract<StylePropertyName, "strokeWidth" | "strokeDasharray">,
  value: string
): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (property === "strokeDasharray") {
    return normalized === "none" || normalized === "" ? "0" : normalized;
  }
  const numeric = Number.parseFloat(normalized);
  return Number.isNaN(numeric) ? normalized : String(numeric);
}
