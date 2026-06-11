import { useMemo, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import mermaid from "mermaid";
import EditorView from "./modes/EditorView";
import { vscode } from "./vscodeApi";
import { normalizeClassDefStyleProperties } from "./parsers/classParser";
import { readInitialData } from "./utils/initialData";
import styles from "./App.module.css";

type Mode = "autorender" | "editor";

/** Root application component. Manages mode selection and Mermaid autorender. */
export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");
  const [renderError, setRenderError] = useState<string | null>(null);
  const mermaidContainerRef = useRef<HTMLDivElement | null>(null);
  const renderIdRef = useRef(`shiny-source-diagram-${Math.random().toString(36).slice(2)}`);

  const initialData = useMemo(() => readInitialData(), []);
  const { fileName, firstLine, lineCount, characterCount, sourceText } = initialData;
  const renderableSourceText = useMemo(
    () => normalizeClassDefStyleProperties(sourceText),
    [sourceText]
  );

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      htmlLabels: false,
      theme: "base",
      themeVariables: {
        primaryColor: "#f8fafc",
        primaryBorderColor: "#64748b",
        primaryTextColor: "#111827",
        lineColor: "#475569",
        textColor: "#111827",
        fontFamily: "Arial, sans-serif",
      },
    });
  }, []);

  useEffect(() => {
    if (mode !== "autorender" || !mermaidContainerRef.current) {
      return;
    }

    let disposed = false;

    async function renderDiagram(): Promise<void> {
      try {
        if (!renderableSourceText.trim()) {
          throw new Error("No Mermaid source text was available from the active document.");
        }

        const { svg } = await mermaid.render(renderIdRef.current, renderableSourceText);

        if (!disposed && mermaidContainerRef.current) {
          mermaidContainerRef.current.innerHTML = svg;
          setRenderError(null);
        }
      } catch (error) {
        if (!disposed) {
          setRenderError(error instanceof Error ? error.message : "Mermaid render failed.");
        }
      }
    }

    void renderDiagram();

    return () => {
      disposed = true;
    };
  }, [mode, renderableSourceText]);

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

