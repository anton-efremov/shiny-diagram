/**
 * @fileoverview Derives View-owned style definition render models.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { StyleView } from "../../../View/views";

/**
 * Derives style views for declared style definitions.
 */
export function deriveStyleViews(model: DiagramGraph): StyleView[] {
  return [...model.styleDefinitions.values()].map((styleDef) => ({
    styleId: styleDef.id,
    name: styleDef.name,
    style: styleDef.properties,
  }));
}
