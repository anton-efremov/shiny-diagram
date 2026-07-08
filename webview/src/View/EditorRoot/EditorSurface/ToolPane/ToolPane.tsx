/**
 * @behavior Active placement tool state slicing and UI prop derivation.
 * @render Diagram creation tool palette.
 */

import type { ReactElement } from "react";
import type {
  NamespaceGestureState,
  NodePlacementState,
  RelationshipSeed,
} from "../../../state/editorStates";
import ClassTools from "./ClassTools/ClassTools";
import RelationshipTools from "./RelationshipTools/RelationshipTools";
import styles from "./ToolPane.module.css";

type ToolPaneProps = {
  readonly nodePlacementState: NodePlacementState;
  readonly namespaceGestureState: NamespaceGestureState;
  readonly onClassPlacementStart: () => void;
  readonly onNotePlacementStart: () => void;
  readonly onNamespacePlacementStart: () => void;
  readonly onRelationshipPlacementStart: (seed: RelationshipSeed) => void;
};

export default function ToolPane({
  nodePlacementState,
  namespaceGestureState,
  onClassPlacementStart,
  onNotePlacementStart,
  onNamespacePlacementStart,
  onRelationshipPlacementStart,
}: ToolPaneProps): ReactElement {
  // View and State slice props derivation
  const relationshipPlacementState =
    nodePlacementState?.kind === "relationship" ? nodePlacementState : null;

  // UI props derivation
  const isClassPlacementActive = nodePlacementState?.kind === "class";
  const isNotePlacementActive = nodePlacementState?.kind === "note";
  const isNamespacePlacementActive = namespaceGestureState.kind === "creating";

  return (
    <aside className={styles.toolPane} aria-label="Diagram tools">
      <ClassTools
        isClassPlacementActive={isClassPlacementActive}
        isNotePlacementActive={isNotePlacementActive}
        isNamespacePlacementActive={isNamespacePlacementActive}
        onPlacementStart={onClassPlacementStart}
        onNotePlacementStart={onNotePlacementStart}
        onNamespacePlacementStart={onNamespacePlacementStart}
      />
      <RelationshipTools
        relationshipPlacementState={relationshipPlacementState}
        onRelationshipPlacementStart={onRelationshipPlacementStart}
      />
    </aside>
  );
}
