/**
 * @fileoverview Derives View-owned relationship render models from Controller relationship edges.
 */

import type { DiagramGraph } from "../../model/diagramGraph";
import type { RelationshipView } from "../../../View/views";

/**
 * Derives relationship views whose endpoints both have spatial data.
 */
export function deriveRelationshipViews(model: DiagramGraph): RelationshipView[] {
  return [...model.relationships.values()].flatMap((rel) => {
    const source = model.classes.get(rel.source.classId);
    const target = model.classes.get(rel.target.classId);
    if (!source?.spatial || !target?.spatial) return [];

    return [
      {
        relationshipId: rel.id,
        ordinal: rel.ordinal,
        sourceClassId: rel.source.classId,
        targetClassId: rel.target.classId,
        sourceEndpointKind: rel.source.endpointKind,
        targetEndpointKind: rel.target.endpointKind,
        lineKind: rel.lineKind,
        sourceMultiplicity: rel.source.multiplicity ?? undefined,
        targetMultiplicity: rel.target.multiplicity ?? undefined,
        label: rel.label ?? undefined,
      },
    ];
  });
}
