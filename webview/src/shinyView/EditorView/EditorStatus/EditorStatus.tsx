import type { ReactElement } from "react";
import type { EditorDispatch } from "../../commands/editorCommand";
import type { EditorViewModel } from "../views";
import { useEditorStatusInteractions } from "./useEditorStatusInteractions";
import styles from "./EditorStatus.module.css";

type EditorStatusProps = {
  view: EditorViewModel;
  dispatch: EditorDispatch;
};

/**
 * Renders Shiny-only editor status and source-generation actions.
 */
export default function EditorStatus({ view, dispatch }: EditorStatusProps): ReactElement | null {
  const { onGenerate } = useEditorStatusInteractions(dispatch);

  if (view.status === "ready") return null;

  if (view.status === "invalidSyntax") {
    return <div className={styles.statusMessage}>⚠ Invalid Mermaid syntax: {view.message}</div>;
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
