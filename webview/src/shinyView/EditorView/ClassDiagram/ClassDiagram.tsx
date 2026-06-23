import type { ReactElement } from "react";
import type { NodeTypes } from "@xyflow/react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import {
  useEditorClassSelectionState,
  useEditorPlacementModeState,
  useEditorStatusModelState,
} from "../contexts";
import { useClassBoxNodeInteractions } from "./useClassBoxNodeInteractions";
import { useClassDiagramFlowState } from "./useClassDiagramFlowState";
import { useCanvasInteractions } from "./useCanvasInteractions";
import ClassBox from "./ClassBox/ClassBox";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import styles from "./ClassDiagram.module.css";

const nodeTypes = { classBox: ClassBox } satisfies NodeTypes;

/**
 * Renders the ReactFlow class diagram canvas.
 */
export default function ClassDiagram(): ReactElement {
  const { elements } = useEditorStatusModelState();
  const { selectedClassIds } = useEditorClassSelectionState();
  const { placementMode } = useEditorPlacementModeState();
  if (!elements) {
    throw new Error("ClassDiagram requires editor elements");
  }

  const isPlacementActive = placementMode !== null;
  const { rfNodes, rfEdges, onNodesChange } = useClassDiagramFlowState(elements, selectedClassIds);
  const { onNodeDragStop } = useClassBoxNodeInteractions();
  const { onSelectionChange, onPaneClick } = useCanvasInteractions();

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
          {rfNodes.length === 0 ? (
            <p className={styles.emptyState}>No spatial annotations found.</p>
          ) : null}
          <Background />
          <Controls showInteractive={false} />
          <PlacementOverlay />
        </ReactFlow>
      </ReactFlowProvider>
    </section>
  );
}
