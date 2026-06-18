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
import { useEditorState, useCanvasState } from "../../../controller";
import { useClassBoxController } from "./useClassBoxController";
import { useCanvasController } from "./useCanvasController";
import ClassBox from "../ClassBox/ClassBox";
import {
  type ClassBoxNodeDescriptor,
  type RelationshipEdgeDescriptor,
  toClassBoxNodeDescriptors,
  toRelationshipEdgeDescriptors,
} from "./reactFlowAdapters";
import styles from "./ClassDiagram.module.css";

export default function ClassDiagram(): ReactElement {
  const { elementViews } = useEditorState();
  const { canvasState } = useCanvasState();

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
    setRfEdges(toRelationshipEdgeDescriptors(elementViews?.classes ?? [], elementViews?.relationships ?? []));
  }, [elementViews?.classes, elementViews?.relationships]);

  const handleNodesChange = useCallback((changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
    setRfNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const { onNodeDragStop, onNodeClick } = useClassBoxController(elementViews);
  const { onPaneClick } = useCanvasController();

  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      {rfNodes.length === 0 ? (
        <p className={styles.emptyState}>No spatial annotations found.</p>
      ) : (
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
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag
            zoomOnScroll
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        </ReactFlowProvider>
      )}
    </section>
  );
}
