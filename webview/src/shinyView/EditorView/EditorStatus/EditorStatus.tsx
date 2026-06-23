import type { ReactElement } from "react";
import ControlButton from "../Controls/ControlButton";
import { GenerateIcon } from "../Controls/icons";
import { useEditorStatusModelState } from "../contexts";
import { useEditorStatusInteractions } from "./useEditorStatusInteractions";
import styles from "./EditorStatus.module.css";

/**
 * Renders Shiny-only editor status and source-generation actions.
 */
export default function EditorStatus(): ReactElement | null {
  const { view } = useEditorStatusModelState();
  const { onGenerate } = useEditorStatusInteractions();

  if (view.status === "ready") return null;

  if (view.status === "invalidSyntax") {
    return <div className={styles.statusMessage}>⚠ Invalid Mermaid syntax: {view.message}</div>;
  }

  return (
    <div className={styles.statusMessage}>
      ⚠ Missing annotations
      <ControlButton icon={<GenerateIcon />} label="Generate" onClick={onGenerate} />
    </div>
  );
}
