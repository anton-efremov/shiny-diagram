/**
 * @role [L+P] Logic plus presentational
 * @logic Placement-active canvas interaction gating.
 * @presents React Flow class diagram canvas.
 */
import type { ReactElement } from "react";
import type { NodeTypes } from "@xyflow/react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { useClassBoxNodeInteractions } from "./useClassBoxNodeInteractions";
import { useClassDiagramFlowState } from "./useClassDiagramFlowState";
import { useCanvasInteractions } from "./useCanvasInteractions";
import ClassBox from "./ClassBox/ClassBox";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import type { ClassDiagramView } from "./views";
import styles from "./ClassDiagram.module.css";

const nodeTypes = { classBox: ClassBox } satisfies NodeTypes;

type ClassDiagramProps = {
  readonly view: ClassDiagramView;
};

/**
 * Renders the ReactFlow class diagram canvas.
 */
export default function ClassDiagram({ view }: ClassDiagramProps): ReactElement {
  // @job logic:ui-prop
  const isPlacementActive = view.placementMode !== null;

  // @job adapt:framework-props
  const { rfNodes, rfEdges, onNodesChange } = useClassDiagramFlowState(
    view.elements,
    view.selectedClassIds
  );

  // @job wire:command
  const { onNodeDragStop } = useClassBoxNodeInteractions(view.elements.classes);

  // @job wire:action
  const { onSelectionChange, onPaneClick } = useCanvasInteractions(
    view.elements.classes.map((classView) => classView.classId)
  );

  // @job render:ui
  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      <ReactFlowProvider>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onSelectionChange={onSelectionChange}
          onPaneClick={onPaneClick}
          onNodeDragStop={onNodeDragStop}
          fitView
          nodesDraggable={!isPlacementActive}
          nodesConnectable={false}
          elementsSelectable={!isPlacementActive}
          nodesFocusable={!isPlacementActive}
          edgesFocusable={false}
          disableKeyboardA11y
          deleteKeyCode={null}
          panOnDrag={!isPlacementActive}
          zoomOnScroll
        >
          {/* @job render:ui */}
          {rfNodes.length === 0 ? (
            <p className={styles.emptyState}>No spatial annotations found.</p>
          ) : null}
          <Background />
          <Controls showInteractive={false} />
          <PlacementOverlay view={{ placementMode: view.placementMode }} />
        </ReactFlow>
      </ReactFlowProvider>
    </section>
  );
}
