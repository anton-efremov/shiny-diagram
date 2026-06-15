import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { Mode } from "../../App";
import type { ParseResult } from "../../parsers/classDiagram";
import Toggle from "../../ui/Toggle/Toggle";
import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  parseResult: ParseResult;
  onGenerate: () => void;
};

/**
 * Status message for the toolbar — a plain value derived from mode and
 * parseResult, not a sub-component.
 */
function getStatusMessage(
  mode: Mode,
  parseResult: ParseResult,
  onGenerate: () => void
): ReactElement | null {
  if (mode !== "editor" || parseResult.ok) return null;

  if (parseResult.error === "invalidSyntax") {
    return (
      <span className={styles.statusMessage}>⚠ Invalid Mermaid syntax: {parseResult.message}</span>
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

export default function AppHeader({
  mode,
  setMode,
  parseResult,
  onGenerate,
}: AppHeaderProps): ReactElement {
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
        {getStatusMessage(mode, parseResult, onGenerate)}
      </div>
    </header>
  );
}
