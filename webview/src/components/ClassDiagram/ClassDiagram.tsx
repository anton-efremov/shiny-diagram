import type { ReactElement } from "react";
import type { Node } from "@xyflow/react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import ClassBox from "./ClassBox/ClassBox";
import styles from "./ClassDiagram.module.css";

type ClassDiagramProps = {
  nodes: Node[];
};

/**
 * Renders the React Flow canvas populated with ClassBox node types.
 * Owns the ReactFlowProvider boundary and empty-state guard.
 */
export default function ClassDiagram({ nodes }: ClassDiagramProps): ReactElement {
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
