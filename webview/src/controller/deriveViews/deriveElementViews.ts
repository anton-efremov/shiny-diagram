import type { DiagramTree } from "../../primitives";
import { deriveClassBoxViews } from "./deriveClassBoxViews";
import { deriveNamespaceBoxViews } from "./deriveNamespaceBoxViews";
import { deriveRelationshipViews } from "./deriveRelationshipViews";
import type { ElementViews } from "./viewModels";

/**
 * Converts the parsed DiagramTree into render-facing ElementViews.
 *
 * This is the only public derivation entry point. It coordinates specialized
 * derivation helpers but does not own parser state, command behavior, React
 * state, DOM access, or VS Code access.
 */
export function deriveElementViews(model: DiagramTree): ElementViews {
  return {
    classes: deriveClassBoxViews(model),
    namespaces: deriveNamespaceBoxViews(model),
    relationships: deriveRelationshipViews(model),
    notes: [],
    legend: { entries: [] },
  };
}
