/**
 * @fileoverview Derives View-owned class-box render models from Controller classes and styles.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { ClassView } from "../../../View/views";

/**
 * Derives class-box views for classes with spatial data.
 */
export function deriveClassBoxViews(model: DiagramGraph): ClassView[] {
  const views: ClassView[] = [];

  for (const node of model.classes.values()) {
    if (!node.spatial) continue;

    const styleEdge = [...model.styleApplications.values()].find((e) => e.targetId === node.id);
    const styleDef = styleEdge ? model.styleDefinitions.get(styleEdge.styleDefId) : undefined;
    const style = node.directStyle ?? styleDef?.properties;

    views.push({
      classId: node.id,
      bounds: {
        x: node.spatial.position.x,
        y: node.spatial.position.y,
        w: node.spatial.size.width,
        h: node.spatial.size.height,
      },
      header: {
        label: node.label,
        stereotype: node.annotation ?? undefined,
      },
      members: [
        ...node.attributes.map((attribute) => ({
          memberId: attribute.id,
          text: attribute.text,
          isStatic: attribute.isStatic,
          isAbstract: attribute.isAbstract,
          kind: "field" as const,
        })),
        ...node.methods.map((method) => ({
          memberId: method.id,
          text: method.text,
          isStatic: method.isStatic,
          isAbstract: method.isAbstract,
          kind: "method" as const,
        })),
      ],
      style,
      appliedStyleId: styleEdge?.styleDefId,
    });
  }

  return views;
}
