import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { Node } from "@xyflow/react";
import { extractSpatialBoxes, toReactFlowNodes } from "../parsers/classParser";
import ClassDiagram from "../components/ClassDiagram/ClassDiagram";
import StylePane from "../components/StylePane/StylePane";
import ToolPane from "../components/ToolPane/ToolPane";
import styles from "./EditorMode.module.css";

type EditorModeProps = {
  sourceText: string;
};

/**
 * Renders the Editor mode: parses spatial annotations from the source via the
 * Mermaid AST pipeline and delegates canvas rendering to ClassDiagram.
 */
export default function EditorMode({ sourceText }: EditorModeProps): ReactElement {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function parse(): Promise<void> {
      try {
        const boxes = await extractSpatialBoxes(sourceText);
        if (!cancelled) {
          setNodes(toReactFlowNodes(boxes));
        }
      } catch {
        if (!cancelled) {
          setNodes([]);
        }
      }
    }

    void parse();

    return () => {
      cancelled = true;
    };
  }, [sourceText]);

  return (
    <section className={styles.editorShell} aria-label="Class diagram editor">
      <ToolPane />
      <div className={styles.canvasRegion}>
        <ClassDiagram nodes={nodes} />
      </div>
      <StylePane />
    </section>
  );
}
