import type { ReactElement } from "react";
import type { EditorDispatch } from "../commands/editorCommand";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import { EditorViewProvider, useEditorStatusModelState } from "./contexts";
import EditorStatus from "./EditorStatus/EditorStatus";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import type { EditorViewModel } from "./views";
import styles from "./EditorView.module.css";

type EditorViewProps = {
  view: EditorViewModel;
  dispatch: EditorDispatch;
};

/**
 * Renders the visual class-diagram editor shell.
 */
export default function EditorView({ view, dispatch }: EditorViewProps): ReactElement {
  return (
    <EditorViewProvider view={view} dispatch={dispatch}>
      <EditorViewContent />
    </EditorViewProvider>
  );
}

function EditorViewContent(): ReactElement {
  const { view } = useEditorStatusModelState();

  if (view.status === "invalidSyntax") {
    return (
      <>
        <EditorStatus />
        <section className={styles.editorShell} aria-label="Class diagram editor">
          <ToolPane />
          <div className={styles.canvasRegion}>
            <div className={styles.errorCanvas}>
              <p className={styles.errorMessage}>{view.message}</p>
            </div>
          </div>
          <StylePane />
        </section>
      </>
    );
  }

  if (view.status === "missingAnnotations") {
    return (
      <>
        <EditorStatus />
        <section className={styles.editorShell} aria-label="Class diagram editor">
          <ToolPane />
          <div className={styles.canvasRegion}>
            <div className={styles.missingCanvas}>
              <p className={styles.missingLabel}>Classes without spatial annotations:</p>
              <ul className={styles.missingList}>
                {view.missingIds.map((id) => (
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
      <EditorStatus />
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
