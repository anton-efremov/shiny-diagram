/**
 * @role [L+P] Logic plus presentational
 * @logic Status-specific message/action visibility.
 * @presents Editor status banner and Generate action.
 */
import type { ReactElement } from "react";
import ControlButton from "../Controls/ControlButton";
import { GenerateIcon } from "../Controls/icons";
import { useEditorStatusInteractions } from "./useEditorStatusInteractions";
import type { EditorStatusView } from "./views";
import styles from "./EditorStatus.module.css";

type EditorStatusProps = {
  readonly view: EditorStatusView;
};

/**
 * Renders Shiny-only editor status and source-generation actions.
 */
export default function EditorStatus({ view }: EditorStatusProps): ReactElement | null {
  // @job wire:command
  const { onGenerate } = useEditorStatusInteractions();

  // @job logic:ui-prop
  if (view.status === "ready") return null;

  // @job logic:ui-prop
  if (view.status === "invalidSyntax") {
    // @job render:ui
    return <div className={styles.statusMessage}>⚠ Invalid Mermaid syntax: {view.message}</div>;
  }

  // @job render:ui
  return (
    <div className={styles.statusMessage}>
      ⚠ Missing annotations
      <ControlButton icon={<GenerateIcon />} label="Generate" onClick={onGenerate} />
    </div>
  );
}
