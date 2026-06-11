import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { Mode } from "../../types";
import AutorenderMode from "../../modes/AutorenderMode";
import EditorMode from "../../modes/EditorMode";
import styles from "./Layout.module.css";

type LayoutProps = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  fileName: string;
  firstLine: string;
  lineCount: number;
  characterCount: number;
  sourceText: string;
};

/**
 * Shell chrome and mode routing. Renders the header, mode-toggle toolbar, mode
 * label, and the active mode view.
 */
export default function Layout({
  mode,
  setMode,
  fileName,
  firstLine,
  lineCount,
  characterCount,
  sourceText,
}: LayoutProps): ReactElement {

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Shiny Diagram</h1>
          <p className={styles.meta}>
            {fileName} · {lineCount} lines · {characterCount} characters
          </p>
          <p className={styles.meta}>First line: {firstLine || "(empty)"}</p>
        </div>
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
        </div>
      </header>

      <section className={styles.modeLabel}>
        Mode: {mode === "autorender" ? "Autorender" : "Editor"}
      </section>

      {mode === "autorender" ? (
        <AutorenderMode sourceText={sourceText} />
      ) : (
        <EditorMode sourceText={sourceText} />
      )}
    </main>
  );
}
