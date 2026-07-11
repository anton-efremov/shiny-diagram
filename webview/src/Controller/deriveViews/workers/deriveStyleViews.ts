/**
 * @fileoverview Derives View-owned style definition render models.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { BaseStyleView, StyleView } from "../../../View/views";

/**
 * Derives source-ordered views for every style occurrence.
 */
export function deriveStyleViews(model: DiagramGraph): StyleView[] {
  return model.styleOccurrences.map((occurrence) => ({ ...occurrence }));
}

/**
 * Resolves the position-independent base customization, with later declarations
 * replacing only the properties they explicitly write.
 */
export function deriveBaseStyleView(model: DiagramGraph): BaseStyleView {
  const baseStyle: Partial<Record<keyof BaseStyleView, string>> = {};
  for (const occurrence of model.styleOccurrences) {
    if (occurrence.kind !== "declared" || occurrence.name !== "default") continue;
    for (const [property, value] of Object.entries(occurrence.properties)) {
      if (value !== null) baseStyle[property as keyof BaseStyleView] = value;
    }
  }
  return baseStyle;
}
