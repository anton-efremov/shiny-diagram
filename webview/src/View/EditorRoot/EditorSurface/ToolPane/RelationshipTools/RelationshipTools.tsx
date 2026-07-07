/**
 * @behavior Relationship placement preset mapping and active preset comparison.
 * @render Relationship creation tools.
 */

import type { ReactElement } from "react";
import type { RelationshipType } from "../../../../../shared/uml";
import type { NodePlacementState, RelationshipSeed } from "../../../../state/editorStates";
import ControlButton from "../../../../ui/ControlButton/ControlButton";
import styles from "./RelationshipTools.module.css";

type RelationshipToolsProps = {
  readonly relationshipPlacementState: Extract<NodePlacementState, { kind: "relationship" }> | null;
  readonly onRelationshipPlacementStart: (seed: RelationshipSeed) => void;
};

type ToolPaneItem = {
  readonly relationshipType: RelationshipType;
  readonly icon: string;
  readonly name: string;
  readonly seed: RelationshipSeed;
};

const relationshipTools: readonly ToolPaneItem[] = [
  {
    relationshipType: "association",
    icon: "--",
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
    icon: "-->",
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
    icon: "<-->",
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
    icon: "..>",
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
    icon: "<|--",
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
    icon: "..|>",
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
    icon: "o--",
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
    icon: "*--",
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
    <div className={styles.toolGroup} aria-label="Relationship elements">
      {relationshipTools.map((tool) => {
        const isActive = seedsEqual(relationshipPlacementState?.seed ?? null, tool.seed);
        return (
          <ControlButton
            key={tool.relationshipType}
            className={styles.toolButton}
            variant="compact"
            icon={
              <span className={styles.toolIcon} aria-hidden="true">
                {tool.icon}
              </span>
            }
            aria-label={tool.name}
            active={isActive}
            pressed={isActive}
            title={tool.name}
            onClick={() => onRelationshipPlacementStart(tool.seed)}
          />
        );
      })}
    </div>
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
