import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { ParseResult } from "../../parsers/classDiagram";
import type { Mode } from "../../types";
import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  parseResult: ParseResult;
  onGenerate: () => void;
};

export default function AppHeader({
  mode,
  setMode,
  parseResult,
  onGenerate,
}: AppHeaderProps): ReactElement {
  const ribbonStatus = (): ReactElement | null => {
    if (mode !== "editor") return null;
    if (parseResult.ok) return null;

    if (parseResult.error === "invalidSyntax") {
      return (
        <span className={styles.statusMessage}>
          ⚠ Invalid Mermaid syntax: {parseResult.message}
        </span>
      );
    }

    if (parseResult.error === "missingAnnotations") {
      return (
        <span className={styles.statusMessage}>
          ⚠ Missing annotations
          <button className={styles.generateButton} type="button" onClick={onGenerate}>
            Generate
          </button>
        </span>
      );
    }

    return null;
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Shiny Diagram</h1>
      <div className={styles.toolbar} aria-label="Diagram modes">
        <button
          className={mode === "autorender" ? styles.activeButton : styles.button}
          type="button"
          onClick={() => setMode("autorender")}
        >
          Autorender
        </button>
        <button
          className={mode === "editor" ? styles.activeButton : styles.button}
          type="button"
          onClick={() => setMode("editor")}
        >
          Editor
        </button>
        {ribbonStatus()}
      </div>
    </header>
  );
}
