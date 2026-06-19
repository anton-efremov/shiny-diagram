import type { ReactElement } from "react";
import { useEditorState } from "../contexts/EditorStateContext";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import styles from "./EditorView.module.css";

export default function EditorView(): ReactElement {
  const { parseStatus } = useEditorState();

  if (parseStatus.status === "invalidSyntax") {
    return (
      <section className={styles.editorShell} aria-label="Class diagram editor">
        <ToolPane />
        <div className={styles.canvasRegion}>
          <div className={styles.errorCanvas}>
            <p className={styles.errorMessage}>{parseStatus.message}</p>
          </div>
        </div>
        <StylePane />
      </section>
    );
  }

  if (parseStatus.status === "missingAnnotations") {
    return (
      <section className={styles.editorShell} aria-label="Class diagram editor">
        <ToolPane />
        <div className={styles.canvasRegion}>
          <div className={styles.missingCanvas}>
            <p className={styles.missingLabel}>Classes without spatial annotations:</p>
            <ul className={styles.missingList}>
              {parseStatus.missingIds.map((id) => (
                <li key={id} className={styles.missingItem}>
                  {id}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <StylePane />
      </section>
    );
  }

  return (
    <section className={styles.editorShell} aria-label="Class diagram editor">
      <ToolPane />
      <div className={styles.canvasRegion}>
        <ClassDiagram />
      </div>
      <StylePane />
    </section>
  );
}
