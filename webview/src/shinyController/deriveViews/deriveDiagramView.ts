/**
 * @fileoverview Coordinates projection of a DiagramTree into View-owned render contracts.
 */

import type { DiagramTree } from "../model/diagramTree";
import type { DiagramView } from "../../shinyView/views";
import { deriveClassBoxViews } from "./workers/deriveClassBoxViews";
import { deriveNamespaceBoxViews } from "./workers/deriveNamespaceBoxViews";
import { deriveRelationshipViews } from "./workers/deriveRelationshipViews";

/**
 * Derives all render-facing views from a Controller diagram tree.
 */
export function deriveDiagramView(model: DiagramTree): DiagramView {
  return {
    classes: deriveClassBoxViews(model),
    namespaces: deriveNamespaceBoxViews(model),
    relationships: deriveRelationshipViews(model),
  };
}
