import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { parseDiagram } from "../parsers/classDiagram";
import { formatSpatialAnnotation } from "../parsers/classDiagram/formatSpatial";
import type { ClassBoxProps } from "../parsers/classDiagram/diagramModel";
import type { ApplyEditsMessage } from "../protocol";
import { vscode } from "../vscodeApi";
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
 * to ClassDiagram. Handles drag events by computing a source diff and
 * posting it to the extension host.
 */
export default function EditorMode({ sourceText }: EditorModeProps): ReactElement {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

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

  const selectedClassBox = useMemo(
    () => classBoxes.find((box) => box.node.id === selectedClassId),
    [classBoxes, selectedClassId]
  );

  useEffect(() => {
    if (selectedClassId && !selectedClassBox) {
      setSelectedClassId(null);
    }
  }, [selectedClassBox, selectedClassId]);

  const handleNodeDragStop = useCallback(
    (classId: string, x: number, y: number) => {
      const box = classBoxes.find((b) => b.node.id === classId);
      if (!box) return;

      const newText = formatSpatialAnnotation(box.spatial, x, y);
      const message: ApplyEditsMessage = {
        type: "applyEdits",
        edits: [{ lineNumber: box.spatial.location.line, newText }],
      };
      vscode.postMessage(message);
    },
    [classBoxes]
  );

  return (
    <section className={styles.editorShell} aria-label="Class diagram editor">
      <ToolPane />
      <div className={styles.canvasRegion}>
        <ClassDiagram
          classBoxes={classBoxes}
          selectedClassId={selectedClassId}
          onSelectedClassIdChange={setSelectedClassId}
          onNodeDragStop={handleNodeDragStop}
        />
      </div>
      <StylePane selectedClassBox={selectedClassBox} />
    </section>
  );
}
