/**
 * @behavior Active class placement tool UI prop derivation.
 * @render Diagram creation tool palette.
 */

import type { ReactElement } from "react";
import type { NodePlacementState } from "../../../state/editorStates";
import ClassTools from "./ClassTools/ClassTools";
import RelationshipTools from "./RelationshipTools/RelationshipTools";
import styles from "./ToolPane.module.css";

type ToolPaneProps = {
  readonly nodePlacementState: NodePlacementState;
  readonly onClassPlacementStart: () => void;
};

export default function ToolPane({
  nodePlacementState,
  onClassPlacementStart,
}: ToolPaneProps): ReactElement {
  // UI props derivation
  const isClassPlacementActive = nodePlacementState === "class";

  return (
    <aside className={styles.toolPane} aria-label="Diagram tools">
      <ClassTools
        isClassPlacementActive={isClassPlacementActive}
        onPlacementStart={onClassPlacementStart}
      />
      <RelationshipTools />
    </aside>
  );
}
