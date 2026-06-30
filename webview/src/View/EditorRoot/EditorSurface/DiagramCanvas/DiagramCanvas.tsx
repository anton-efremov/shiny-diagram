/**
 * @role [L]+[P]
 * @logic ClassBoxPlacementState lifecycle and class diagram interaction routing.
 * @state classBoxPlacementState: framework-neutral class box positions and dimensions.
 * @presents Diagram shell and empty state.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { ClassId } from "../../../../shared/ids";
import type { DiagramView } from "../../../views/schema";
import type { NodePlacementState, SelectionState } from "../../../state/editorStates";
import { toInitialClassBoxPlacementState } from "./state";
import { useInteractions } from "./useInteractions";
import { useStateReconciliation } from "./useStateReconciliation";
import ReactFlowCanvasAdapter from "./ReactFlowCanvasAdapter/ReactFlowCanvasAdapter";
import styles from "./DiagramCanvas.module.css";

type ClassDiagramProps = {
  readonly view: DiagramView;
  readonly selectionState: SelectionState;
  readonly nodePlacementState: NodePlacementState;
  readonly onSelectionChange: (classIds: readonly ClassId[]) => void;
  readonly onSelectionClear: () => void;
  readonly onPlacementComplete: () => void;
};

export default function ClassDiagram({
  view,
  selectionState,
  nodePlacementState,
  onSelectionChange: onSelectionChangeProp,
  onSelectionClear,
  onPlacementComplete,
}: ClassDiagramProps): ReactElement {
  /** State: framework-neutral class box positions and dimensions */
  const [classBoxPlacementState, setClassBoxPlacementState] = useState(() =>
    toInitialClassBoxPlacementState(view.classes)
  );

  /** State reconciliation: class box placement is repaired against canonical class views */
  useStateReconciliation({ view: view.classes, setClassBoxPlacementState });

  /** Event handler derivation: class box placement updates and class drag transactions */
  const { onClassBoxPlacementChange, onDragComplete } = useInteractions({
    view: view.classes,
    setClassBoxPlacementState,
  });

  /** Render return */
  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      {view.classes.length === 0 ? (
        <p className={styles.emptyState}>No spatial annotations found.</p>
      ) : null}
      <ReactFlowCanvasAdapter
        view={view}
        selectionState={selectionState}
        nodePlacementState={nodePlacementState}
        classBoxPlacementState={classBoxPlacementState}
        onClassBoxPlacementChange={onClassBoxPlacementChange}
        onDragComplete={onDragComplete}
        onSelectionChange={onSelectionChangeProp}
        onSelectionClear={onSelectionClear}
        onPlacementComplete={onPlacementComplete}
      />
    </section>
  );
}
