import type { ReactElement } from "react";
import type { Node } from "@xyflow/react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import type { ClassBoxProps } from "../../parsers/classDiagram/diagramModel";
import ClassBox from "./ClassBox/ClassBox";
import styles from "./ClassDiagram.module.css";

type ClassDiagramProps = {
  classBoxes: ClassBoxProps[];
};

/**
 * Renders the React Flow canvas populated with ClassBox node types.
 * Converts ClassBoxProps to React Flow Node descriptors internally.
 * Owns the ReactFlowProvider boundary and empty-state guard.
 */
export default function ClassDiagram({ classBoxes }: ClassDiagramProps): ReactElement {
  const nodes: Node<ClassBoxProps, "classBox">[] = classBoxes.map((box) => ({
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
    draggable: false,
    selectable: false,
  }));

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
            fitView
            nodesDraggable={false}
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
