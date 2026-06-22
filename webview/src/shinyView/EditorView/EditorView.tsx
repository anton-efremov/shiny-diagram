import type { ReactElement } from "react";
import { useEditorState } from "../contexts/EditorStateContext";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import EditorStatus from "./EditorStatus/EditorStatus";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import styles from "./EditorView.module.css";

/**
 * Renders the visual class-diagram editor shell.
 */
export default function EditorView(): ReactElement {
  const { editorStatus } = useEditorState();

  if (editorStatus.status === "invalidSyntax") {
    return (
      <>
        <EditorStatus editorStatus={editorStatus} />
        <section className={styles.editorShell} aria-label="Class diagram editor">
          <ToolPane />
          <div className={styles.canvasRegion}>
            <div className={styles.errorCanvas}>
              <p className={styles.errorMessage}>{editorStatus.message}</p>
            </div>
          </div>
          <StylePane />
        </section>
      </>
    );
  }

  if (editorStatus.status === "missingAnnotations") {
    return (
      <>
        <EditorStatus editorStatus={editorStatus} />
        <section className={styles.editorShell} aria-label="Class diagram editor">
          <ToolPane />
          <div className={styles.canvasRegion}>
            <div className={styles.missingCanvas}>
              <p className={styles.missingLabel}>Classes without spatial annotations:</p>
              <ul className={styles.missingList}>
                {editorStatus.missingIds.map((id) => (
                  <li key={id} className={styles.missingItem}>
                    {id}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <StylePane />
        </section>
      </>
    );
  }

  return (
    <>
      <EditorStatus editorStatus={editorStatus} />
      <section className={styles.editorShell} aria-label="Class diagram editor">
        <ToolPane />
        <div className={styles.canvasRegion}>
          <ClassDiagram />
        </div>
        <StylePane />
      </section>
    </>
  );
}
