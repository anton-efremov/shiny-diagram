import type { ReactElement } from "react";
import type { EditorStatusView } from "./views";
import { useEditorStatusInteractions } from "./useEditorStatusInteractions";
import styles from "./EditorStatus.module.css";

type EditorStatusProps = {
  editorStatus: EditorStatusView;
};

/**
 * Renders Shiny-only editor status and source-generation actions.
 */
export default function EditorStatus({ editorStatus }: EditorStatusProps): ReactElement | null {
  const { onGenerate } = useEditorStatusInteractions();

  if (editorStatus.status === "ready") return null;

  if (editorStatus.status === "invalidSyntax") {
    return (
      <div className={styles.statusMessage}>⚠ Invalid Mermaid syntax: {editorStatus.message}</div>
    );
  }

  return (
    <div className={styles.statusMessage}>
      ⚠ Missing annotations
      <button className={styles.generateButton} type="button" onClick={onGenerate}>
        Generate
      </button>
    </div>
  );
}
