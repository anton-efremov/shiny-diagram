import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { computeDragEdit } from "../../formatters/classDiagram/computeDragEdit";
import { computeStyleEdit } from "../../formatters/classDiagram/computeStyleEdit";
import type { ParseResult } from "../../parsers/classDiagram";
import type {
  ClassNode,
  RelationshipEdge,
  StyleDefNode,
} from "../../models/classDiagram/diagramTreeModel";
import type { ApplyEditsMessage } from "../../extensionBridge/protocol";
import { vscode } from "../../extensionBridge/vscodeApi";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import styles from "./EditorView.module.css";

type EditorViewProps = {
  parseResult: ParseResult;
};

export type ClassBoxProps = {
  readonly node: ClassNode;
  readonly styleDef?: StyleDefNode;
};

/**
 * Renders the Editor view canvas. Delegates to ClassDiagram when the parse
 * result is fully resolved; shows inline fallback UI for error states.
 */
export default function EditorView({ parseResult }: EditorViewProps): ReactElement {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const model = parseResult.ok
    ? parseResult.model
    : parseResult.error === "missingAnnotations"
      ? parseResult.model
      : null;

  const classBoxes = useMemo((): ClassBoxProps[] => {
    if (!model) return [];
    const result: ClassBoxProps[] = [];

    for (const node of model.classes.values()) {
      if (!node.spatial) continue;

      const styleEdge = model.appliesStyleEdges.find((edge) => edge.source === node.id);
      const styleDef = styleEdge ? model.styleDefs.get(styleEdge.target) : undefined;
      result.push({ node, styleDef });
    }
    return result;
  }, [model]);

  const relationships = useMemo((): RelationshipEdge[] => {
    if (!model) return [];
    return model.relationships.filter((relationship) => {
      const source = model.classes.get(relationship.source);
      const target = model.classes.get(relationship.target);
      return Boolean(source?.spatial) && Boolean(target?.spatial);
    });
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

      const edit = computeDragEdit(box.node, x, y);
      if (!edit) return;

      const message: ApplyEditsMessage = { type: "applyEdits", edits: [edit] };
      vscode.postMessage(message);
    },
    [classBoxes]
  );

  const handleFillColorChange = useCallback(
    (fill: string) => {
      if (!selectedClassBox?.styleDef) return;

      const edit = computeStyleEdit(selectedClassBox.styleDef, "fill", fill);
      const message: ApplyEditsMessage = { type: "applyEdits", edits: [edit] };
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
