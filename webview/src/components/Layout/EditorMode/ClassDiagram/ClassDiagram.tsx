import { useCallback, useEffect, useState } from "react";
import type { MouseEvent, ReactElement } from "react";
import type { NodeChange, OnNodeDrag } from "@xyflow/react";
import {
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import type { RelationshipEdge } from "../../../../models/classDiagram/diagramTreeModel";
import type { ClassBoxProps } from "../EditorMode";
import ClassBox from "./ClassBox/ClassBox";
import styles from "./ClassDiagram.module.css";
import {
  type ClassBoxNodeDescriptor,
  type RelationshipEdgeDescriptor,
  toClassBoxNodeDescriptors,
  toRelationshipEdgeDescriptors,
} from "./reactFlowAdapters";

type ClassDiagramProps = {
  classBoxes: ClassBoxProps[];
  relationships: RelationshipEdge[];
  selectedClassId: string | null;
  onSelectedClassIdChange: (classId: string | null) => void;
  onNodeDragStop: (classId: string, x: number, y: number) => void;
};

/**
 * Renders the React Flow canvas populated with ClassBox node types.
 * Maintains internal React Flow node/edge state so React Flow can track
 * drag positions. Syncs that state from classBoxes/relationships whenever
 * the parsed model updates.
 */
export default function ClassDiagram({
  classBoxes,
  relationships,
  selectedClassId,
  onSelectedClassIdChange,
  onNodeDragStop,
}: ClassDiagramProps): ReactElement {
  const [reactFlowNodes, setReactFlowNodes] = useState<ClassBoxNodeDescriptor[]>(() =>
    toClassBoxNodeDescriptors(classBoxes, selectedClassId)
  );
  const [reactFlowEdges, setReactFlowEdges] = useState<RelationshipEdgeDescriptor[]>(() =>
    toRelationshipEdgeDescriptors(classBoxes, relationships)
  );

  // Sync React Flow node positions when the parsed model changes (e.g. after
  // a sourceUpdate). Without this, stale positions linger after source edits.
  useEffect(() => {
    setReactFlowNodes(toClassBoxNodeDescriptors(classBoxes, selectedClassId));
  }, [classBoxes, selectedClassId]);

  useEffect(() => {
    setReactFlowEdges(toRelationshipEdgeDescriptors(classBoxes, relationships));
  }, [classBoxes, relationships]);

  const handleNodesChange = useCallback((changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
    setReactFlowNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const handleNodeClick = useCallback(
    (_event: MouseEvent, reactFlowNode: ClassBoxNodeDescriptor) => {
      onSelectedClassIdChange(reactFlowNode.id);
    },
    [onSelectedClassIdChange]
  );

  const handlePaneClick = useCallback(() => {
    onSelectedClassIdChange(null);
  }, [onSelectedClassIdChange]);

  const handleNodeDragStop = useCallback<OnNodeDrag<ClassBoxNodeDescriptor>>(
    (_event, reactFlowNode) => {
      onNodeDragStop(reactFlowNode.id, reactFlowNode.position.x, reactFlowNode.position.y);
    },
    [onNodeDragStop]
  );

  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      {reactFlowNodes.length === 0 ? (
        <p className={styles.emptyState}>No spatial annotations found.</p>
      ) : (
        <ReactFlowProvider>
          <ReactFlow
            nodes={reactFlowNodes}
            edges={reactFlowEdges}
            nodeTypes={{ classBox: ClassBox }}
            onNodesChange={handleNodesChange}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onNodeDragStop={handleNodeDragStop}
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
