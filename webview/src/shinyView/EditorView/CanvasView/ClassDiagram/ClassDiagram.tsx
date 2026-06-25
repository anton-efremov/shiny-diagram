/**
 * @role [L]+[P] Logic and Presentational
 * @logic DiagramLayoutState lifecycle, child view projection.
 * @state layoutState: framework-neutral class box positions and dimensions.
 * @presents Diagram shell and empty state.
 */

import { useCallback, useState, useEffect } from "react";
import type { ReactElement } from "react";
import type { ClassDiagramView } from "./views";
import {
  applyPositionChanges,
  createInitialDiagramLayoutState,
  reconcileLayoutWithClassViews,
} from "./state";
import type { ClassPositionChange } from "./state";
import { toClassDiagramChildView } from "./childViews";
import { useClassDiagramInteractions } from "./useInteractions";
import ReactFlowCanvasAdapter from "./ReactFlowCanvasAdapter/ReactFlowCanvasAdapter";
import styles from "./ClassDiagram.module.css";

type ClassDiagramProps = {
  readonly view: ClassDiagramView;
};

export default function ClassDiagram({ view }: ClassDiagramProps): ReactElement {
  // @job logic:state:initialize
  const [layoutState, setLayoutState] = useState(() =>
    createInitialDiagramLayoutState(view.elements.classes)
  );

  // @job logic:state:reconcile
  useEffect(() => {
    setLayoutState((state) => reconcileLayoutWithClassViews(state, view.elements.classes));
  }, [view.elements.classes]);

  // @job logic:state:update
  const onLayoutChange = useCallback((changes: readonly ClassPositionChange[]) => {
    setLayoutState((state) => applyPositionChanges(state, changes));
  }, []);

  // @job logic:child:view
  const canvasAdapterView = toClassDiagramChildView(layoutState, view);

  // @job connect:event:wire
  const { onDragComplete, onSelectionChange, onPaneClick } = useClassDiagramInteractions(
    view.elements.classes
  );

  // @job render:structure
  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      {view.elements.classes.length === 0 ? (
        <p className={styles.emptyState}>No spatial annotations found.</p>
      ) : null}
      <ReactFlowCanvasAdapter
        view={canvasAdapterView}
        onLayoutChange={onLayoutChange}
        onDragComplete={onDragComplete}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
      />
    </section>
  );
}
