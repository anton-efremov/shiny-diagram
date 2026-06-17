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
import type { ElementViews } from "../../domain/classDiagram/derive/viewModel";
import type { EditorCommand } from "../../domain/classDiagram/commands/commandTypes";
import type { Selection } from "../selection";
import { useClassBoxController } from "../interactions/useClassBoxController";
import { useCanvasController } from "../interactions/useCanvasController";
import ClassBox from "./ClassBox";
import {
  type ClassBoxNodeDescriptor,
  type RelationshipEdgeDescriptor,
  toClassBoxNodeDescriptors,
  toRelationshipEdgeDescriptors,
} from "./reactFlowAdapters";
import styles from "./ClassDiagram.module.css";

type ClassDiagramProps = {
  views: ElementViews;
  selection: Selection;
  dispatch: (command: EditorCommand) => void;
  onSelectionChange: (selection: Selection) => void;
};

export default function ClassDiagram({
  views,
  selection,
  dispatch,
  onSelectionChange,
}: ClassDiagramProps): ReactElement {
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

  const { onNodeDragStop, onNodeClick } = useClassBoxController({
    views,
    dispatch,
    onSelectionChange,
  });

  const { onPaneClick } = useCanvasController({ onSelectionChange });

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
