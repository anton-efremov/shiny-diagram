import type { ReactElement } from "react";
import type { AppMode } from "../state";
import type { EditorHeaderState } from "./views";
import { useAppHeaderInteractions } from "./useAppHeaderInteractions";
import Toggle from "../../ui/Toggle/Toggle";
import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  parseStatus: EditorHeaderState;
};

function getStatusMessage(
  mode: AppMode,
  parseStatus: EditorHeaderState,
  onGenerate: () => void
): ReactElement | null {
  if (mode !== "editor" || parseStatus.status === "ready") return null;

  if (parseStatus.status === "invalidSyntax") {
    return (
      <span className={styles.statusMessage}>⚠ Invalid Mermaid syntax: {parseStatus.message}</span>
    );
  }

  return (
    <span className={styles.statusMessage}>
      ⚠ Missing annotations
      <button className={styles.generateButton} type="button" onClick={onGenerate}>
        Generate
      </button>
    </span>
  );
}

/**
 * Renders diagram mode controls and editor parse status actions.
 */
export default function AppHeader({ mode, setMode, parseStatus }: AppHeaderProps): ReactElement {
  const { onGenerate } = useAppHeaderInteractions();

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Shiny Diagram</h1>
      <div className={styles.toolbar}>
        <Toggle
          options={[
            { value: "autorender", label: "Autorender" },
            { value: "editor", label: "Editor" },
          ]}
          value={mode}
          onChange={setMode}
          ariaLabel="Diagram modes"
        />
        {getStatusMessage(mode, parseStatus, onGenerate)}
      </div>
    </header>
  );
}
