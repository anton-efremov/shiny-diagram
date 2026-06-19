/**
 * @fileoverview Coordinates projection of a DiagramTree into ElementViews.
 */

import type { DiagramTree } from "../model/diagramTree";
import type { ElementViews } from "./viewModels";
import { deriveClassBoxViews } from "./workers/deriveClassBoxViews";
import { deriveNamespaceBoxViews } from "./workers/deriveNamespaceBoxViews";
import { deriveRelationshipViews } from "./workers/deriveRelationshipViews";

/**
 * Derives all render-facing views from a Controller diagram tree.
 */
export function deriveElementViews(model: DiagramTree): ElementViews {
  return {
    classes: deriveClassBoxViews(model),
    namespaces: deriveNamespaceBoxViews(model),
    relationships: deriveRelationshipViews(model),
  };
}
