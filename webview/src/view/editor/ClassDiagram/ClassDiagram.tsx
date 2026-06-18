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
import type { ElementViews } from "../../../controller/derive/viewModel";
import { useEditorSelection } from "../../../controller/EditorSelectionContext";
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

type ClassDiagramProps = {
  views: ElementViews;
};

export default function ClassDiagram({ views }: ClassDiagramProps): ReactElement {
  const { selection } = useEditorSelection();

  const [rfNodes, setRfNodes] = useState<ClassBoxNodeDescriptor[]>(() =>
    toClassBoxNodeDescriptors(views.classes, selection.selectedClassId)
  );
  const [rfEdges, setRfEdges] = useState<RelationshipEdgeDescriptor[]>(() =>
    toRelationshipEdgeDescriptors(views.classes, views.relationships)
  );

  useEffect(() => {
    setRfNodes(toClassBoxNodeDescriptors(views.classes, selection.selectedClassId));
  }, [views.classes, selection.selectedClassId]);

  useEffect(() => {
    setRfEdges(toRelationshipEdgeDescriptors(views.classes, views.relationships));
  }, [views.classes, views.relationships]);

  const handleNodesChange = useCallback((changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
    setRfNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const { onNodeDragStop, onNodeClick } = useClassBoxController(views);
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
