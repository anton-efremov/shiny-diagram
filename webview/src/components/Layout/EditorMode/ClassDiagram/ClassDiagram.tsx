import { useCallback, useEffect, useState } from "react";
import type { MouseEvent, ReactElement } from "react";
import type { Edge, Node, NodeChange, OnNodeDrag } from "@xyflow/react";
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

type ClassBoxNode = Node<ClassBoxProps, "classBox">;

type ClassDiagramProps = {
  classBoxes: ClassBoxProps[];
  relationships: RelationshipEdge[];
  selectedClassId: string | null;
  onSelectedClassIdChange: (classId: string | null) => void;
  onNodeDragStop: (classId: string, x: number, y: number) => void;
};

type BoxSide = "top" | "right" | "bottom" | "left";

/** Builds React Flow node descriptors from resolved ClassBoxProps. */
function toNodes(classBoxes: ClassBoxProps[], selectedClassId: string | null): ClassBoxNode[] {
  return classBoxes.flatMap((box) => {
    const spatial = box.node.spatial;
    if (!spatial) return [];

    return [
      {
        id: box.node.id,
        type: "classBox",
        position: { x: spatial.x, y: spatial.y },
        data: box,
        selected: box.node.id === selectedClassId,
        width: spatial.width,
        height: spatial.height,
        style: {
          width: spatial.width,
          height: spatial.height,
        },
      },
    ];
  });
}

/** Builds simple React Flow edges from parsed class relationships. */
function toEdges(classBoxes: ClassBoxProps[], relationships: RelationshipEdge[]): Edge[] {
  const boxesById = new Map(classBoxes.map((box) => [box.node.id, box]));

  return relationships.flatMap((relationship, index) => {
    const source = boxesById.get(relationship.source);
    const target = boxesById.get(relationship.target);
    if (!source || !target) return [];

    const sourceSide = chooseSourceSide(source, target);
    const targetSide = oppositeSide(sourceSide);

    return [
      {
        id: `${relationship.source}-${relationship.target}-${index}`,
        source: relationship.source,
        target: relationship.target,
        sourceHandle: sourceSide,
        targetHandle: `target-${targetSide}`,
        label: relationship.label,
        type: "default",
      },
    ];
  });
}

function chooseSourceSide(source: ClassBoxProps, target: ClassBoxProps): BoxSide {
  const sourceSpatial = source.node.spatial;
  const targetSpatial = target.node.spatial;

  if (!sourceSpatial || !targetSpatial) {
    return "right";
  }

  const sourceCenterX = sourceSpatial.x + sourceSpatial.width / 2;
  const sourceCenterY = sourceSpatial.y + sourceSpatial.height / 2;
  const targetCenterX = targetSpatial.x + targetSpatial.width / 2;
  const targetCenterY = targetSpatial.y + targetSpatial.height / 2;
  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }

  return dy >= 0 ? "bottom" : "top";
}

function oppositeSide(side: BoxSide): BoxSide {
  switch (side) {
    case "top":
      return "bottom";
    case "right":
      return "left";
    case "bottom":
      return "top";
    case "left":
      return "right";
  }
}

/**
 * Renders the React Flow canvas populated with ClassBox node types.
 * Maintains internal nodes state so React Flow can track drag positions.
 * Syncs that state from classBoxes whenever the parsed model updates.
 */
export default function ClassDiagram({
  classBoxes,
  relationships,
  selectedClassId,
  onSelectedClassIdChange,
  onNodeDragStop,
}: ClassDiagramProps): ReactElement {
  const [nodes, setNodes] = useState<ClassBoxNode[]>(() => toNodes(classBoxes, selectedClassId));
  const [edges, setEdges] = useState<Edge[]>(() => toEdges(classBoxes, relationships));

  // Sync React Flow node positions when the parsed model changes (e.g. after
  // a sourceUpdate). Without this, stale positions linger after source edits.
  useEffect(() => {
    setNodes(toNodes(classBoxes, selectedClassId));
  }, [classBoxes, selectedClassId]);

  useEffect(() => {
    setEdges(toEdges(classBoxes, relationships));
  }, [classBoxes, relationships]);

  const handleNodesChange = useCallback((changes: NodeChange<ClassBoxNode>[]) => {
    setNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const handleNodeClick = useCallback(
    (_event: MouseEvent, node: ClassBoxNode) => {
      onSelectedClassIdChange(node.id);
    },
    [onSelectedClassIdChange]
  );

  const handlePaneClick = useCallback(() => {
    onSelectedClassIdChange(null);
  }, [onSelectedClassIdChange]);

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
            edges={edges}
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
