import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { Mode } from "../../types";
import AutorenderMode from "../../modes/AutorenderMode";
import EditorMode from "../../modes/EditorMode";
import styles from "./Layout.module.css";

type LayoutProps = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  sourceText: string;
};

/**
 * Shell chrome and mode routing. Renders the header, mode-toggle toolbar,
 * and the active mode view.
 */
export default function Layout({ mode, setMode, sourceText }: LayoutProps): ReactElement {
  return (
    <main className={styles.shell}>
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
        </div>
      </header>

      {mode === "autorender" ? (
        <AutorenderMode sourceText={sourceText} />
      ) : (
        <EditorMode sourceText={sourceText} />
      )}
    </main>
  );
}
