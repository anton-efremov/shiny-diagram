import type {
  ClassId,
  DiagramTree,
  MemberId,
  NamespaceId,
  NoteId,
  Rect,
  RelationshipType,
  SourceLocation,
} from "../../primitives";
import { toMemberId } from "../../primitives";

// View model types — the contract of deriveElementViews

/** Stable derived ID for a relationship; not a source fact. */
export type RelationshipViewId = string & { readonly __brand: "RelationshipViewId" };
export const toRelationshipViewId = (s: string): RelationshipViewId => s as RelationshipViewId;

/**
 * Flag: `kind` field is not in the spec's ClassBoxView member shape, but is
 * needed to preserve the field/method divider in ClassBox rendering.
 */
export type ClassBoxMemberView = {
  readonly memberId: MemberId;
  readonly prefix: string;
  readonly text: string;
  readonly kind: "field" | "method";
};

/**
 * Flag: `style.name` is not in the spec but is needed so StylePane can display
 * the classDef name (e.g. "Rose") for the selected class.
 */
export type ClassBoxView = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly ClassBoxMemberView[];
  readonly style?: {
    readonly fill?: string;
    readonly stroke?: string;
    readonly color?: string;
    readonly name?: string;
  };
};

export type NamespaceBoxView = {
  readonly namespaceId: NamespaceId;
  readonly bounds: Rect;
  readonly label: string;
  readonly style?: { readonly fill?: string; readonly stroke?: string; readonly color?: string };
};

export type RelationshipView = {
  readonly viewId: RelationshipViewId;
  readonly sourceClassId: ClassId;
  readonly targetClassId: ClassId;
  readonly relationType: RelationshipType;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly label?: string;
  readonly sourceLocation: SourceLocation;
};

export type NoteView = {
  readonly noteId: NoteId;
  readonly text: string;
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
  readonly attachedTo?: ClassId;
};

export type LegendView = {
  readonly entries: readonly { readonly label: string; readonly style: { fill?: string; stroke?: string; color?: string } }[];
};

export type ElementViews = {
  readonly classes: readonly ClassBoxView[];
  readonly namespaces: readonly NamespaceBoxView[];
  readonly relationships: readonly RelationshipView[];
  readonly notes: readonly NoteView[];
  readonly legend: LegendView;
};

/**
 * Converts a DiagramTree into renderable ElementViews.
 * Pure function — no React, DOM, or VS Code imports.
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

function deriveClassBoxViews(model: DiagramTree): ClassBoxView[] {
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

function deriveNamespaceBoxViews(model: DiagramTree): NamespaceBoxView[] {
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

function deriveRelationshipViews(model: DiagramTree): RelationshipView[] {
  return model.relationships.flatMap((rel, index) => {
    const source = model.classes.get(rel.source);
    const target = model.classes.get(rel.target);
    if (!source?.spatial || !target?.spatial) return [];

    return [
      {
        viewId: toRelationshipViewId(`${rel.source}--${rel.target}--${index}`),
        sourceClassId: rel.source,
        targetClassId: rel.target,
        relationType: rel.type,
        sourceMultiplicity: rel.sourceMultiplicity,
        targetMultiplicity: rel.targetMultiplicity,
        label: rel.label,
        sourceLocation: rel.location,
      },
    ];
  });
}

function unionRects(rects: Rect[]): Rect {
  const padding = 12;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const r of rects) {
    if (r.x < minX) minX = r.x;
    if (r.y < minY) minY = r.y;
    if (r.x + r.w > maxX) maxX = r.x + r.w;
    if (r.y + r.h > maxY) maxY = r.y + r.h;
  }

  return {
    x: minX - padding,
    y: minY - padding,
    w: maxX - minX + padding * 2,
    h: maxY - minY + padding * 2,
  };
}
