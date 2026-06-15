/**
 * @fileoverview Computes the LineEdit for a box drag — rebuilds its
 * @spatial annotation with new x/y, preserving existing width/height.
 */

import type { ClassNode } from "../../models/classDiagram/diagramTreeModel";
import type { LineEdit } from "../../extensionBridge/protocol";
import { formatSpatialAnnotation } from "./formatLines";

/**
 * @param node - The dragged class node; must have `spatial` defined.
 * @param x - New x position in canvas units.
 * @param y - New y position in canvas units.
 */
export function computeDragEdit(node: ClassNode, x: number, y: number): LineEdit | null {
  if (!node.spatial) return null;
  const newText = formatSpatialAnnotation(node.id, x, y, node.spatial.width, node.spatial.height);
  return { lineNumber: node.spatial.location.startLine, newText };
}
