/**
 * @behavior Active placement tool state slicing and UI prop derivation.
 * @render Diagram creation tool palette.
 */

import type { ReactElement } from "react";
import type { NodePlacementState, RelationshipSeed } from "../../../state/editorStates";
import ClassTools from "./ClassTools/ClassTools";
import RelationshipTools from "./RelationshipTools/RelationshipTools";
import styles from "./ToolPane.module.css";

type ToolPaneProps = {
  readonly nodePlacementState: NodePlacementState;
  readonly onClassPlacementStart: () => void;
  readonly onRelationshipPlacementStart: (seed: RelationshipSeed) => void;
};

export default function ToolPane({
  nodePlacementState,
  onClassPlacementStart,
  onRelationshipPlacementStart,
}: ToolPaneProps): ReactElement {
  // View and State slice props derivation
  const relationshipPlacementState =
    nodePlacementState?.kind === "relationship" ? nodePlacementState : null;

  // UI props derivation
  const isClassPlacementActive = nodePlacementState?.kind === "class";

  return (
    <aside className={styles.toolPane} aria-label="Diagram tools">
      <ClassTools
        isClassPlacementActive={isClassPlacementActive}
        onPlacementStart={onClassPlacementStart}
      />
      <RelationshipTools
        relationshipPlacementState={relationshipPlacementState}
        onRelationshipPlacementStart={onRelationshipPlacementStart}
      />
    </aside>
  );
}
