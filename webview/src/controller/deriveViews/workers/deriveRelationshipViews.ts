/**
 * @fileoverview Derives View-owned relationship render models from Controller relationship edges.
 */

import type { DiagramTree } from "../../model/diagramTree";
import type { RelationshipView } from "../../../view/views";

/**
 * Derives relationship views whose endpoints both have spatial data.
 */
export function deriveRelationshipViews(model: DiagramTree): RelationshipView[] {
  return model.relationships.flatMap((rel) => {
    const source = model.classes.get(rel.source);
    const target = model.classes.get(rel.target);
    if (!source?.spatial || !target?.spatial) return [];

    return [
      {
        relationshipId: rel.id,
        sourceClassId: rel.source,
        targetClassId: rel.target,
        relationType: rel.type,
        sourceMultiplicity: rel.sourceMultiplicity,
        targetMultiplicity: rel.targetMultiplicity,
        label: rel.label,
      },
    ];
  });
}
