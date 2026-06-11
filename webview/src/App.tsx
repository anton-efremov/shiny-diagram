import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import EditorView from "./modes/EditorView";
import { vscode } from "./vscodeApi";
import { useAutorender } from "./useAutorender";
import { readInitialData } from "./utils/initialData";
import styles from "./App.module.css";

type Mode = "autorender" | "editor";

/** Root application component. Owns mode selection and delegates rendering to mode views. */
export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");

  const initialData = useMemo(() => readInitialData(), []);
  const { fileName, firstLine, lineCount, characterCount, sourceText } = initialData;

  const { mermaidContainerRef, renderError } = useAutorender(sourceText, mode === "autorender");

  function handleRenderClick(): void {
    vscode.postMessage({ type: "renderRequested" });
  }

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
          <button className={styles.button} type="button" onClick={handleRenderClick}>
            Render
          </button>
        </div>
      </header>

      <section className={styles.modeLabel}>
        Mode: {mode === "autorender" ? "Autorender" : "Editor"}
      </section>

      {mode === "autorender" ? (
        <section className={styles.canvas} aria-label="Mermaid autorender">
          {renderError ? <pre className={styles.error}>{renderError}</pre> : null}
          <div className={styles.mermaidOutput} ref={mermaidContainerRef} />
        </section>
      ) : (
        <EditorView sourceText={sourceText} />
      )}
    </main>
  );
}
