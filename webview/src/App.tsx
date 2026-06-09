import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import mermaid from "mermaid";
import { vscode } from "./vscodeApi";

type Mode = "autorender" | "editor";

type AppProps = {
  rootElement: HTMLElement;
};

const hardcodedDiagram = `classDiagram
direction LR
class ConversationThread
class TextMessage
class UserContact
ConversationThread --> TextMessage : contains
ConversationThread --> UserContact : involves`;

export default function App({ rootElement }: AppProps): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");
  const [renderError, setRenderError] = useState<string | null>(null);
  const mermaidContainerRef = useRef<HTMLDivElement | null>(null);
  const renderIdRef = useRef(`shiny-hardcoded-diagram-${Math.random().toString(36).slice(2)}`);

  const fileName = rootElement.dataset.fileName ?? "No active document";
  const firstLine = rootElement.dataset.firstLine ?? "";
  const lineCount = rootElement.dataset.lineCount ?? "0";
  const characterCount = rootElement.dataset.characterCount ?? "0";

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "default"
    });
  }, []);

  useEffect(() => {
    if (mode !== "autorender" || !mermaidContainerRef.current) {
      return;
    }

    let disposed = false;

    async function renderDiagram(): Promise<void> {
      try {
        const { svg } = await mermaid.render(renderIdRef.current, hardcodedDiagram);

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
  }, [mode]);

  function handleRenderClick(): void {
    vscode.postMessage({ type: "renderRequested" });
  }

  return (
    <main style={styles.shell}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Shiny Diagram</h1>
          <p style={styles.meta}>
            {fileName} · {lineCount} lines · {characterCount} characters
          </p>
          <p style={styles.meta}>First line: {firstLine || "(empty)"}</p>
        </div>
        <div style={styles.toolbar} aria-label="Diagram modes">
          <button
            style={mode === "autorender" ? styles.activeButton : styles.button}
            type="button"
            onClick={() => setMode("autorender")}
          >
            Autorender
          </button>
          <button
            style={mode === "editor" ? styles.activeButton : styles.button}
            type="button"
            onClick={() => setMode("editor")}
          >
            Editor
          </button>
          <button style={styles.button} type="button" onClick={handleRenderClick}>
            Render
          </button>
        </div>
      </header>

      <section style={styles.modeLabel}>Mode: {mode === "autorender" ? "Autorender" : "Editor"}</section>

      {mode === "autorender" ? (
        <section style={styles.canvas} aria-label="Hardcoded Mermaid autorender">
          {renderError ? <pre style={styles.error}>{renderError}</pre> : null}
          <div ref={mermaidContainerRef} />
        </section>
      ) : (
        <section style={styles.canvas} aria-label="Editor placeholder">
          <p style={styles.placeholder}>Editor mode placeholder</p>
        </section>
      )}
    </main>
  );
}

const styles = {
  shell: {
    boxSizing: "border-box",
    minHeight: "100vh",
    padding: "24px",
    fontFamily: "var(--vscode-font-family)",
    color: "var(--vscode-editor-foreground)",
    background: "var(--vscode-editor-background)"
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "20px"
  },
  title: {
    margin: "0 0 8px",
    fontSize: "22px",
    fontWeight: 600
  },
  meta: {
    margin: "4px 0",
    color: "var(--vscode-descriptionForeground)"
  },
  toolbar: {
    display: "flex",
    gap: "8px"
  },
  button: {
    padding: "7px 12px",
    border: "1px solid var(--vscode-button-border, transparent)",
    color: "var(--vscode-button-secondaryForeground)",
    background: "var(--vscode-button-secondaryBackground)",
    cursor: "pointer"
  },
  activeButton: {
    padding: "7px 12px",
    border: "1px solid var(--vscode-focusBorder)",
    color: "var(--vscode-button-foreground)",
    background: "var(--vscode-button-background)",
    cursor: "pointer"
  },
  modeLabel: {
    marginBottom: "12px",
    fontWeight: 600
  },
  canvas: {
    minHeight: "420px",
    padding: "20px",
    border: "1px solid var(--vscode-panel-border)",
    background: "var(--vscode-editorWidget-background)",
    overflow: "auto"
  },
  error: {
    whiteSpace: "pre-wrap",
    color: "var(--vscode-errorForeground)"
  },
  placeholder: {
    margin: 0,
    color: "var(--vscode-descriptionForeground)"
  }
} satisfies Record<string, React.CSSProperties>;
