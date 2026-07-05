/**
 * @behavior ClassBoxPlacementState lifecycle and class diagram interaction routing.
 * @render Diagram shell and empty state.
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

type DiagramCanvasProps = {
  readonly view: DiagramView;
  readonly selectionState: SelectionState;
  readonly nodePlacementState: NodePlacementState;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onSelectionClear: () => void;
  readonly onPlacementComplete: () => void;
};

export default function DiagramCanvas({
  view,
  selectionState,
  nodePlacementState,
  onClassSelect,
  onSelectionClear,
  onPlacementComplete,
}: DiagramCanvasProps): ReactElement {
  // State creation: ledger state - framework-neutral class box positions and dimensions
  const [classBoxPlacementState, setClassBoxPlacementState] = useState(() =>
    toInitialClassBoxPlacementState(view.classes)
  );

  // State reconciliation
  useStateReconciliation({ view: view.classes, setClassBoxPlacementState });

  // Event handler props derivation
  const { onClassBoxPlacementChange, onDragComplete } = useInteractions({
    view: view.classes,
    setClassBoxPlacementState,
  });

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
        onClassSelect={onClassSelect}
        onSelectionClear={onSelectionClear}
        onPlacementComplete={onPlacementComplete}
      />
    </section>
  );
}
