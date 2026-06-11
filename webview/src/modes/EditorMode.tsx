import { useMemo } from "react";
import type { ReactElement } from "react";
import { parseDiagram } from "../parsers/classDiagram";
import type { ClassBoxProps } from "../parsers/classDiagram/diagramModel";
import ClassDiagram from "../components/ClassDiagram/ClassDiagram";
import StylePane from "../components/StylePane/StylePane";
import ToolPane from "../components/ToolPane/ToolPane";
import styles from "./EditorMode.module.css";

type EditorModeProps = {
  sourceText: string;
};

/**
 * Renders the Editor mode: parses source into DiagramModel, resolves
 * ClassBoxProps for annotated classes, and delegates canvas rendering
 * to ClassDiagram. Only classes with a matching spatial annotation are rendered.
 */
export default function EditorMode({ sourceText }: EditorModeProps): ReactElement {
  const classBoxes = useMemo((): ClassBoxProps[] => {
    const model = parseDiagram(sourceText);
    const result: ClassBoxProps[] = [];

    for (const [id, node] of model.classes) {
      const spatial = model.spatialAnnotations.get(id);
      if (!spatial) continue;

      const style = node.styleDefName ? model.styleDefinitions.get(node.styleDefName) : undefined;

      result.push({ node, spatial, style });
    }

    return result;
  }, [sourceText]);

  return (
    <section className={styles.editorShell} aria-label="Class diagram editor">
      <ToolPane />
      <div className={styles.canvasRegion}>
        <ClassDiagram classBoxes={classBoxes} />
      </div>
      <StylePane />
    </section>
  );
}
