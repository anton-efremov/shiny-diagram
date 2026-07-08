/**
 * @fileoverview Derives View-owned namespace render models from source membership.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { NamespaceView } from "../../../View/views";

/**
 * Derives namespace views without geometry; the canvas derives hulls each render.
 */
export function deriveNamespaceBoxViews(model: DiagramGraph): NamespaceView[] {
  return [...model.namespaces.values()].map((namespaceNode) => ({
    namespaceId: namespaceNode.id,
    label: namespaceNode.label,
    parentNamespaceId: namespaceNode.parentNamespaceId,
    memberClassIds: [...model.classes.values()]
      .filter((classNode) => classNode.parentNamespaceId === namespaceNode.id)
      .map((classNode) => classNode.id),
    childNamespaceIds: [...model.namespaces.values()]
      .filter((candidate) => candidate.parentNamespaceId === namespaceNode.id)
      .map((candidate) => candidate.id),
    ...(namespaceNode.style ? { style: namespaceNode.style } : {}),
  }));
}
