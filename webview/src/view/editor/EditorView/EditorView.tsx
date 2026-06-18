import type { ReactElement } from "react";
import { useEditorState } from "../../../controller/EditorStateContext";
import { useEditorSelection } from "../../../controller/EditorSelectionContext";
import ClassDiagram from "../ClassDiagram/ClassDiagram";
import StylePane from "../StylePane/StylePane";
import ToolPane from "../ToolPane/ToolPane";
import styles from "./EditorView.module.css";

export default function EditorView(): ReactElement {
  const { parseStatus, elementViews } = useEditorState();
  const { selection } = useEditorSelection();

  const selectedView = elementViews?.classes.find((v) => v.classId === selection.selectedClassId);

  if (parseStatus.status === "invalidSyntax") {
    return (
      <section className={styles.editorShell} aria-label="Class diagram editor">
        <ToolPane />
        <div className={styles.canvasRegion}>
          <div className={styles.errorCanvas}>
            <p className={styles.errorMessage}>{parseStatus.message}</p>
          </div>
        </div>
        <StylePane selectedView={undefined} />
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
        <StylePane selectedView={undefined} />
      </section>
    );
  }

  return (
    <section className={styles.editorShell} aria-label="Class diagram editor">
      <ToolPane />
      <div className={styles.canvasRegion}>
        {elementViews ? <ClassDiagram views={elementViews} /> : null}
      </div>
      <StylePane selectedView={selectedView} />
    </section>
  );
}
