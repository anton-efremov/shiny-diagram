import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { NodeChange } from "@xyflow/react";
import {
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useEditorState } from "../../../contexts/EditorStateContext";
import { useCanvasState } from "../../../contexts/CanvasStateContext";
import { useClassBoxNodeInteractions } from "./useClassBoxNodeInteractions";
import { useCanvasInteractions } from "./useCanvasInteractions";
import ClassBox from "./ClassBox/ClassBox";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import {
  type ClassBoxNodeDescriptor,
  type RelationshipEdgeDescriptor,
  toClassBoxNodeDescriptors,
  toRelationshipEdgeDescriptors,
} from "./reactFlowAdapters";
import styles from "./ClassDiagram.module.css";

/**
 * Renders the ReactFlow class diagram canvas.
 */
export default function ClassDiagram(): ReactElement {
  const { elementViews } = useEditorState();
  const { canvasState } = useCanvasState();
  const isPlacementActive = canvasState.placementMode !== null;

  const [rfNodes, setRfNodes] = useState<ClassBoxNodeDescriptor[]>(() =>
    toClassBoxNodeDescriptors(elementViews?.classes ?? [], canvasState.selectedClassId)
  );
  const [rfEdges, setRfEdges] = useState<RelationshipEdgeDescriptor[]>(() =>
    toRelationshipEdgeDescriptors(elementViews?.classes ?? [], elementViews?.relationships ?? [])
  );

  useEffect(() => {
    setRfNodes(toClassBoxNodeDescriptors(elementViews?.classes ?? [], canvasState.selectedClassId));
  }, [elementViews?.classes, canvasState.selectedClassId]);

  useEffect(() => {
    setRfEdges(
      toRelationshipEdgeDescriptors(elementViews?.classes ?? [], elementViews?.relationships ?? [])
    );
  }, [elementViews?.classes, elementViews?.relationships]);

  const handleNodesChange = useCallback((changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
    setRfNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const { onNodeDragStop, onNodeClick } = useClassBoxNodeInteractions(elementViews);
  const { onPaneClick } = useCanvasInteractions();

  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      <ReactFlowProvider>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={{ classBox: ClassBox }}
          onNodesChange={handleNodesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeDragStop={onNodeDragStop}
          fitView
          nodesDraggable={!isPlacementActive}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={!isPlacementActive}
          zoomOnScroll
        >
          {rfNodes.length === 0 ? (
            <p className={styles.emptyState}>No spatial annotations found.</p>
          ) : null}
          <Background />
          <Controls showInteractive={false} />
          <PlacementOverlay placementMode={canvasState.placementMode} />
        </ReactFlow>
      </ReactFlowProvider>
    </section>
  );
}
