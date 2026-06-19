/**
 * @fileoverview Derives renderable relationships from parsed relationship edges.
 */

import type { DiagramTree } from "../../model/diagramTree";
import type { RelationshipView } from "../viewModels";
import { toRelationshipViewId } from "../viewIds";

/**
 * Derives relationship views whose endpoints both have spatial data.
 */
export function deriveRelationshipViews(model: DiagramTree): RelationshipView[] {
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
