import { useMemo } from "react";
import type { ReactElement } from "react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { extractSpatialBoxes, toReactFlowNodes } from "../parsers/classParser";
import ClassBox from "../components/ClassBox/ClassBox";
import styles from "./EditorView.module.css";

type EditorViewProps = {
  sourceText: string;
};

/**
 * Renders the Editor mode canvas: a React Flow diagram populated from
 * spatial annotations in the Mermaid source.
 */
export default function EditorView({ sourceText }: EditorViewProps): ReactElement {
  const boxes = useMemo(() => extractSpatialBoxes(sourceText), [sourceText]);
  const nodes = useMemo(() => toReactFlowNodes(boxes), [boxes]);

  return (
    <section className={styles.editorShell} aria-label="Static editor boxes">
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
