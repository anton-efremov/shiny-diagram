/**
 * @fileoverview Derives View-owned style definition render models.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { StyleView } from "../../../View/views";

/**
 * Derives source-ordered views for every style occurrence.
 */
export function deriveStyleViews(model: DiagramGraph): StyleView[] {
  return model.styleOccurrences.map((occurrence) => ({ ...occurrence }));
}
