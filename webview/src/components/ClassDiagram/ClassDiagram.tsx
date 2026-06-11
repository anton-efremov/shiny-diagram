import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { Node, NodeChange, OnNodeDrag } from "@xyflow/react";
import {
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import type { ClassBoxProps } from "../../parsers/classDiagram/diagramModel";
import ClassBox from "./ClassBox/ClassBox";
import styles from "./ClassDiagram.module.css";

type ClassBoxNode = Node<ClassBoxProps, "classBox">;

type ClassDiagramProps = {
  classBoxes: ClassBoxProps[];
  onNodeDragStop: (classId: string, x: number, y: number) => void;
};

/** Builds React Flow node descriptors from resolved ClassBoxProps. */
function toNodes(classBoxes: ClassBoxProps[]): ClassBoxNode[] {
  return classBoxes.map((box) => ({
    id: box.node.id,
    type: "classBox",
    position: { x: box.spatial.x, y: box.spatial.y },
    data: box,
    width: box.spatial.width,
    height: box.spatial.height,
    style: {
      width: box.spatial.width,
      height: box.spatial.height,
    },
  }));
}

/**
 * Renders the React Flow canvas populated with ClassBox node types.
 * Maintains internal nodes state so React Flow can track drag positions.
 * Syncs that state from classBoxes whenever the parsed model updates.
 */
export default function ClassDiagram({
  classBoxes,
  onNodeDragStop,
}: ClassDiagramProps): ReactElement {
  const [nodes, setNodes] = useState<ClassBoxNode[]>(() => toNodes(classBoxes));

  // Sync React Flow node positions when the parsed model changes (e.g. after
  // a sourceUpdate). Without this, stale positions linger after source edits.
  useEffect(() => {
    setNodes(toNodes(classBoxes));
  }, [classBoxes]);

  const handleNodesChange = useCallback((changes: NodeChange<ClassBoxNode>[]) => {
    setNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const handleNodeDragStop = useCallback<OnNodeDrag<ClassBoxNode>>(
    (_event, node) => {
      onNodeDragStop(node.id, node.position.x, node.position.y);
    },
    [onNodeDragStop]
  );

  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      {nodes.length === 0 ? (
        <p className={styles.emptyState}>No spatial annotations found.</p>
      ) : (
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={{ classBox: ClassBox }}
            onNodesChange={handleNodesChange}
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
