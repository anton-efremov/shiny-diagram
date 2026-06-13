import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { formatSpatialAnnotation } from "../../../parsers/classDiagram/formatSpatial";
import { formatStyleDefFill } from "../../../parsers/classDiagram/formatStyleDef";
import type { ParseResult } from "../../../parsers/classDiagram/parseResult";
import type { ClassBoxProps, Relationship } from "../../../parsers/classDiagram/diagramTreeModel";
import type { ApplyEditsMessage } from "../../../protocol";
import { vscode } from "../../../vscodeApi";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import styles from "./EditorMode.module.css";

type EditorModeProps = {
  parseResult: ParseResult;
};

/**
 * Renders the Editor mode canvas. Delegates to ClassDiagram when the parse
 * result is fully resolved; shows inline fallback UI for error states.
 */
export default function EditorMode({ parseResult }: EditorModeProps): ReactElement {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const model = parseResult.ok
    ? parseResult.model
    : parseResult.error === "missingAnnotations"
      ? parseResult.model
      : null;

  const classBoxes = useMemo((): ClassBoxProps[] => {
    if (!model) return [];
    const result: ClassBoxProps[] = [];
    for (const [id, node] of model.classes) {
      const spatial = model.spatialAnnotations.get(id);
      if (!spatial) continue;
      const style = node.styleDefName ? model.styleDefinitions.get(node.styleDefName) : undefined;
      result.push({ node, spatial, style });
    }
    return result;
  }, [model]);

  const relationships = useMemo((): Relationship[] => {
    if (!model) return [];
    return model.relationships.filter(
      (rel) => model.spatialAnnotations.has(rel.source) && model.spatialAnnotations.has(rel.target)
    );
  }, [model]);

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

  const handleFillColorChange = useCallback(
    (fill: string) => {
      if (!selectedClassBox?.style) return;

      const newText = formatStyleDefFill(selectedClassBox.style, fill);
      const message: ApplyEditsMessage = {
        type: "applyEdits",
        edits: [{ lineNumber: selectedClassBox.style.location.line, newText }],
      };
      vscode.postMessage(message);
    },
    [selectedClassBox]
  );

  const canvasContent = (): ReactElement => {
    if (!parseResult.ok && parseResult.error === "invalidSyntax") {
      return (
        <div className={styles.errorCanvas}>
          <p className={styles.errorMessage}>{parseResult.message}</p>
        </div>
      );
    }

    if (!parseResult.ok && parseResult.error === "missingAnnotations") {
      return (
        <div className={styles.missingCanvas}>
          <p className={styles.missingLabel}>Classes without spatial annotations:</p>
          <ul className={styles.missingList}>
            {parseResult.missingIds.map((id) => (
              <li key={id} className={styles.missingItem}>
                {id}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <ClassDiagram
        classBoxes={classBoxes}
        relationships={relationships}
        selectedClassId={selectedClassId}
        onSelectedClassIdChange={setSelectedClassId}
        onNodeDragStop={handleNodeDragStop}
      />
    );
  };

  return (
    <section className={styles.editorShell} aria-label="Class diagram editor">
      <ToolPane />
      <div className={styles.canvasRegion}>{canvasContent()}</div>
      <StylePane selectedClassBox={selectedClassBox} onFillColorChange={handleFillColorChange} />
    </section>
  );
}
