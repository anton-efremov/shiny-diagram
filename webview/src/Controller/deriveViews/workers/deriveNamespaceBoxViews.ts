/**
 * @fileoverview Derives View-owned namespace render models from class membership and bounds.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { Rect } from "../../../shared/geometry";
import type { NamespaceView } from "../../../View/views";
import { unionRects } from "./layoutBounds";

/**
 * Derives namespace views from class membership edges.
 */
export function deriveNamespaceBoxViews(model: DiagramGraph): NamespaceView[] {
  const views: NamespaceView[] = [];

  for (const ns of model.namespaces.values()) {
    if (ns.spatial) {
      views.push({
        namespaceId: ns.id,
        bounds: {
          x: ns.spatial.position.x,
          y: ns.spatial.position.y,
          w: ns.spatial.size.width,
          h: ns.spatial.size.height,
        },
        label: ns.label,
      });
      continue;
    }

    const memberRects: Rect[] = [...model.classes.values()].flatMap((node) => {
      if (node.parentNamespaceId !== ns.id) return [];
      if (!node?.spatial) return [];
      return [
        {
          x: node.spatial.position.x,
          y: node.spatial.position.y,
          w: node.spatial.size.width,
          h: node.spatial.size.height,
        },
      ];
    });

    const bounds = memberRects.length > 0 ? unionRects(memberRects) : { x: 0, y: 0, w: 120, h: 80 };

    views.push({ namespaceId: ns.id, bounds, label: ns.label });
  }

  return views;
}
