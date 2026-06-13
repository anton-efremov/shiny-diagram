import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { formatSpatialAnnotation } from "../../../parsers/classDiagram/formatSpatial";
import { formatStyleDefFill } from "../../../parsers/classDiagram/formatStyleDef";
import type { ParseResult } from "../../../parsers/classDiagram/parseResult";
import type {
  AppliesStyleEdge,
  ClassNode,
  RelationshipEdge,
  StyleDefNode,
} from "../../../models/classDiagram/diagramTreeModel";
import type { ApplyEditsMessage } from "../../../protocol";
import { vscode } from "../../../vscodeApi";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import styles from "./EditorMode.module.css";

type EditorModeProps = {
  parseResult: ParseResult;
};

export type ClassBoxProps = {
  readonly node: ClassNode;
  readonly styleDef?: StyleDefNode;
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
    const styleEdges = model.edges.filter(
      (edge): edge is AppliesStyleEdge => edge.kind === "appliesStyle"
    );

    for (const node of model.nodes.values()) {
      if (node.kind !== "class" || !node.spatial) continue;

      const styleEdge = styleEdges.find((edge) => edge.source === node.id);
      const styleNode = styleEdge ? model.nodes.get(styleEdge.target) : undefined;
      const styleDef = styleNode?.kind === "styleDef" ? styleNode : undefined;
      result.push({ node, styleDef });
    }
    return result;
  }, [model]);

  const relationships = useMemo((): RelationshipEdge[] => {
    if (!model) return [];
    return model.edges
      .filter((edge): edge is RelationshipEdge => edge.kind === "relationship")
      .filter((relationship) => {
        const source = model.nodes.get(relationship.source);
        const target = model.nodes.get(relationship.target);
        return (
          source?.kind === "class" &&
          Boolean(source.spatial) &&
          target?.kind === "class" &&
          Boolean(target.spatial)
        );
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
      if (!box?.node.spatial) return;

      const newText = formatSpatialAnnotation(box.node.spatial, box.node.id, x, y);
      const message: ApplyEditsMessage = {
        type: "applyEdits",
        edits: [{ lineNumber: box.node.spatial.location.startLine, newText }],
      };
      vscode.postMessage(message);
    },
    [classBoxes]
  );

  const handleFillColorChange = useCallback(
    (fill: string) => {
      if (!selectedClassBox?.styleDef) return;

      const newText = formatStyleDefFill(selectedClassBox.styleDef, fill);
      const message: ApplyEditsMessage = {
        type: "applyEdits",
        edits: [{ lineNumber: selectedClassBox.styleDef.location.startLine, newText }],
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
