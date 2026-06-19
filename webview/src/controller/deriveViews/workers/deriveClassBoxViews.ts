/**
 * @fileoverview Derives class-box render models from parsed classes and styles.
 */

import type { DiagramTree } from "../../model/diagramTree";
import type { ClassBoxView } from "../viewModels";
import { toMemberId } from "../viewIds";

/**
 * Derives class-box views for classes with spatial data.
 */
export function deriveClassBoxViews(model: DiagramTree): ClassBoxView[] {
  const views: ClassBoxView[] = [];

  for (const node of model.classes.values()) {
    if (!node.spatial) continue;

    const styleEdge = model.appliesStyleEdges.find((e) => e.source === node.id);
    const styleDef = styleEdge ? model.styleDefs.get(styleEdge.target) : undefined;

    const style = styleDef
      ? {
          fill: styleDef.properties.find((p) => p.property === "fill")?.value,
          stroke: styleDef.properties.find((p) => p.property === "stroke")?.value,
          color: styleDef.properties.find((p) => p.property === "color")?.value,
          name: styleDef.id as string,
        }
      : undefined;

    views.push({
      classId: node.id,
      x: node.spatial.x,
      y: node.spatial.y,
      w: node.spatial.width,
      h: node.spatial.height,
      header: {
        label: node.id as string,
        stereotype: node.annotation?.value,
      },
      members: node.members.map((member) => {
        const memberId = toMemberId(`${node.id}:${member.location.startLine}`);
        if (member.kind === "method") {
          const params = member.params ?? "";
          const typeSuffix = member.returnType ? `: ${member.returnType}` : "";
          return {
            memberId,
            prefix: member.visibility,
            text: `${member.name}(${params})${typeSuffix}`,
            kind: "method" as const,
          };
        }
        const typeSuffix = member.fieldType ? `: ${member.fieldType}` : "";
        return {
          memberId,
          prefix: member.visibility,
          text: `${member.name}${typeSuffix}`,
          kind: "field" as const,
        };
      }),
      style,
    });
  }

  return views;
}
