import type { DiagramTree } from "../../primitives";
import type { Rect } from "../../shared/geometry";
import type { ClassId } from "../../shared/ids";
import { unionRects } from "./layoutBounds";
import type { NamespaceBoxView } from "./viewModels";

/**
 * Derives renderable namespace boxes from parsed namespace membership edges.
 *
 * Namespace bounds are computed from the spatial bounds of contained classes.
 * This is presentation projection logic only.
 */
export function deriveNamespaceBoxViews(model: DiagramTree): NamespaceBoxView[] {
  const views: NamespaceBoxView[] = [];

  for (const ns of model.namespaces.values()) {
    const memberIds = model.inNamespaceEdges
      .filter((e) => e.target === ns.id)
      .map((e) => e.source);

    const memberRects: Rect[] = memberIds.flatMap((classId: ClassId) => {
      const node = model.classes.get(classId);
      if (!node?.spatial) return [];
      return [{ x: node.spatial.x, y: node.spatial.y, w: node.spatial.width, h: node.spatial.height }];
    });

    const bounds = memberRects.length > 0 ? unionRects(memberRects) : { x: 0, y: 0, w: 120, h: 80 };

    views.push({ namespaceId: ns.id, bounds, label: ns.id as string });
  }

  return views;
}
