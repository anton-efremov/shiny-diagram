/**
 * @behavior Relationship placement preset mapping and active preset comparison.
 * @render Relationship creation tools.
 */

import type { ReactElement } from "react";
import type { RelationshipType } from "../../../../../shared/uml";
import type { NodePlacementState, RelationshipSeed } from "../../../../state/editorStates";
import ToggleButton from "../../../../ui/primitives/ToggleButton/ToggleButton";
import {
  AggregationGlyph,
  AssociationGlyph,
  BidirectionalAssociationGlyph,
  CompositionGlyph,
  DependencyGlyph,
  DirectedAssociationGlyph,
  InheritanceGlyph,
  RealizationGlyph,
} from "./icons";

type RelationshipToolsProps = {
  readonly relationshipPlacementState: Extract<NodePlacementState, { kind: "relationship" }> | null;
  readonly onRelationshipPlacementStart: (seed: RelationshipSeed) => void;
};

type ToolPaneItem = {
  readonly relationshipType: RelationshipType;
  readonly icon: () => ReactElement;
  readonly name: string;
  readonly seed: RelationshipSeed;
};

const relationshipTools: readonly ToolPaneItem[] = [
  {
    relationshipType: "association",
    icon: AssociationGlyph,
    name: "Association",
    seed: {
      sourceEndpointKind: "none",
      lineKind: "solid",
      targetEndpointKind: "none",
      sourceMultiplicity: null,
      targetMultiplicity: null,
      label: null,
    },
  },
  {
    relationshipType: "directedAssociation",
    icon: DirectedAssociationGlyph,
    name: "Directed association",
    seed: {
      sourceEndpointKind: "none",
      lineKind: "solid",
      targetEndpointKind: "arrow",
      sourceMultiplicity: null,
      targetMultiplicity: null,
      label: null,
    },
  },
  {
    relationshipType: "bidirectionalAssociation",
    icon: BidirectionalAssociationGlyph,
    name: "Bidirectional association",
    seed: {
      sourceEndpointKind: "arrow",
      lineKind: "solid",
      targetEndpointKind: "arrow",
      sourceMultiplicity: null,
      targetMultiplicity: null,
      label: null,
    },
  },
  {
    relationshipType: "dependency",
    icon: DependencyGlyph,
    name: "Dependency",
    seed: {
      sourceEndpointKind: "none",
      lineKind: "dashed",
      targetEndpointKind: "arrow",
      sourceMultiplicity: null,
      targetMultiplicity: null,
      label: null,
    },
  },
  {
    relationshipType: "inheritance",
    icon: InheritanceGlyph,
    name: "Inheritance",
    seed: {
      sourceEndpointKind: "triangle",
      lineKind: "solid",
      targetEndpointKind: "none",
      sourceMultiplicity: null,
      targetMultiplicity: null,
      label: null,
    },
  },
  {
    relationshipType: "realization",
    icon: RealizationGlyph,
    name: "Realization",
    seed: {
      sourceEndpointKind: "none",
      lineKind: "dashed",
      targetEndpointKind: "triangle",
      sourceMultiplicity: null,
      targetMultiplicity: null,
      label: null,
    },
  },
  {
    relationshipType: "aggregation",
    icon: AggregationGlyph,
    name: "Aggregation",
    seed: {
      sourceEndpointKind: "aggregation",
      lineKind: "solid",
      targetEndpointKind: "none",
      sourceMultiplicity: null,
      targetMultiplicity: null,
      label: null,
    },
  },
  {
    relationshipType: "composition",
    icon: CompositionGlyph,
    name: "Composition",
    seed: {
      sourceEndpointKind: "composition",
      lineKind: "solid",
      targetEndpointKind: "none",
      sourceMultiplicity: null,
      targetMultiplicity: null,
      label: null,
    },
  },
];

export default function RelationshipTools({
  relationshipPlacementState,
  onRelationshipPlacementStart,
}: RelationshipToolsProps): ReactElement {
  return (
    <>
      {relationshipTools.map((tool) => {
        const isActive = seedsEqual(relationshipPlacementState?.seed ?? null, tool.seed);
        const Icon = tool.icon;

        return (
          <ToggleButton
            key={tool.relationshipType}
            icon={<Icon />}
            pressed={isActive}
            title={tool.name}
            onClick={() => onRelationshipPlacementStart(tool.seed)}
          />
        );
      })}
    </>
  );
}

// Private helpers
function seedsEqual(left: RelationshipSeed | null, right: RelationshipSeed): boolean {
  return (
    left !== null &&
    left.sourceEndpointKind === right.sourceEndpointKind &&
    left.lineKind === right.lineKind &&
    left.targetEndpointKind === right.targetEndpointKind &&
    left.sourceMultiplicity === right.sourceMultiplicity &&
    left.targetMultiplicity === right.targetMultiplicity &&
    left.label === right.label
  );
}
