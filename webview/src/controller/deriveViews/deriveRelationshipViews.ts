import type { DiagramTree } from "../../primitives";
import { toRelationshipViewId } from "./relationshipViewId";
import type { RelationshipView } from "./viewModels";

/**
 * Derives renderable relationship views from parsed relationship edges.
 *
 * This keeps only relationships whose endpoints have spatial data, because the
 * current visual editor can render only spatially positioned classes.
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
