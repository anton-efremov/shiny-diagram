/**
 * @role [L]+[P]
 * @logic Active class placement tool UI prop derivation.
 * @presents Diagram creation tool palette.
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
  onClassPlacementStart: onPlacementStart,
}: ToolPaneProps): ReactElement {
  /** Child props derivation: class placement state controls the active class tool */
  const isClassPlacementActive = nodePlacementState === "class";

  return (
    <aside className={styles.toolPane} aria-label="Diagram tools">
      <ClassTools
        isClassPlacementActive={isClassPlacementActive}
        onPlacementStart={onPlacementStart}
      />
      <RelationshipTools />
    </aside>
  );
}
