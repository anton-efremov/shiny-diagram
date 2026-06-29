/**
 * @role [L]+[P] Logic and Presentational
 * @logic ClassBoxLayoutState lifecycle, child view projection.
 * @state layoutState: framework-neutral class box positions and dimensions.
 * @presents Diagram shell and empty state.
 */

import { useCallback, useState, useEffect } from "react";
import type { ReactElement } from "react";
import type { ClassId } from "../../../../shared/ids";
import type { DiagramView } from "../../../views/schema";
import type { NodePlacementState, SelectionState } from "../../../state/editorStates";
import {
  applyPositionChanges,
  createInitialClassBoxLayoutState,
  reconcileLayoutWithClassViews,
} from "./state";
import type { ClassPositionChange } from "./state";
import { useClassDiagramInteractions } from "./useInteractions";
import ReactFlowCanvasAdapter from "./ReactFlowCanvasAdapter/ReactFlowCanvasAdapter";
import styles from "./ClassDiagram.module.css";

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
  // @job logic:state:initialize
  const [layoutState, setLayoutState] = useState(() =>
    createInitialClassBoxLayoutState(view.classes)
  );

  // @job logic:state:reconcile
  useEffect(() => {
    setLayoutState((state) => reconcileLayoutWithClassViews(state, view.classes));
  }, [view.classes]);

  // @job logic:state:update
  const onLayoutChange = useCallback((changes: readonly ClassPositionChange[]) => {
    setLayoutState((state) => applyPositionChanges(state, changes));
  }, []);

  // @job connect:event:wire
  const { onDragComplete } = useClassDiagramInteractions(view.classes);

  // @job render:structure
  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      {view.classes.length === 0 ? (
        <p className={styles.emptyState}>No spatial annotations found.</p>
      ) : null}
      <ReactFlowCanvasAdapter
        view={view}
        selectionState={selectionState}
        nodePlacementState={nodePlacementState}
        classBoxLayoutState={layoutState}
        onLayoutChange={onLayoutChange}
        onDragComplete={onDragComplete}
        onSelectionChange={onSelectionChangeProp}
        onPaneClick={onSelectionClear}
        onPlacementComplete={onPlacementComplete}
      />
    </section>
  );
}
