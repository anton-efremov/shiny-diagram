import { useMemo, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import mermaid from "mermaid";
import EditorView from "./modes/EditorView";
import { vscode } from "./vscodeApi";

type Mode = "autorender" | "editor";

type InitialData = {
  fileName: string;
  firstLine: string;
  lineCount: number;
  characterCount: number;
  sourceText: string;
};

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
    <main style={styles.shell}>
      <style>{mermaidStyles}</style>
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

      <section style={styles.modeLabel}>
        Mode: {mode === "autorender" ? "Autorender" : "Editor"}
      </section>

      {mode === "autorender" ? (
        <section style={styles.canvas} aria-label="Mermaid autorender">
          {renderError ? <pre style={styles.error}>{renderError}</pre> : null}
          <div className="shiny-mermaid-output" ref={mermaidContainerRef} />
        </section>
      ) : (
        <EditorView sourceText={sourceText} />
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
    background: "var(--vscode-editor-background)",
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "22px",
    fontWeight: 600,
  },
  meta: {
    margin: "4px 0",
    color: "var(--vscode-descriptionForeground)",
  },
  toolbar: {
    display: "flex",
    gap: "8px",
  },
  button: {
    padding: "7px 12px",
    border: "1px solid var(--vscode-button-border, transparent)",
    color: "var(--vscode-button-secondaryForeground)",
    background: "var(--vscode-button-secondaryBackground)",
    cursor: "pointer",
  },
  activeButton: {
    padding: "7px 12px",
    border: "1px solid var(--vscode-focusBorder)",
    color: "var(--vscode-button-foreground)",
    background: "var(--vscode-button-background)",
    cursor: "pointer",
  },
  modeLabel: {
    marginBottom: "12px",
    fontWeight: 600,
  },
  canvas: {
    minHeight: "420px",
    padding: "20px",
    border: "1px solid var(--vscode-panel-border)",
    background: "var(--vscode-editorWidget-background)",
    overflow: "auto",
  },
  error: {
    whiteSpace: "pre-wrap",
    color: "var(--vscode-errorForeground)",
  },
} satisfies Record<string, React.CSSProperties>;

const mermaidStyles = `
  .shiny-mermaid-output svg {
    max-width: 100%;
    height: auto;
  }
`;

function normalizeClassDefStyleProperties(source: string): string {
  return source.replace(
    /^(\s*classDef\s+\S+\s+)(.*)$/gm,
    (_line, prefix: string, styles: string) => {
      const normalizedStyles = styles
        .replace(/\bstroke-width:/g, "strokeWidth:")
        .replace(/\bstroke-dasharray:/g, "strokeDasharray:");

      return `${prefix}${normalizedStyles}`;
    }
  );
}

function readInitialData(): InitialData {
  const dataElement = document.getElementById("shiny-initial-data");

  if (!dataElement?.textContent) {
    return {
      fileName: "No active document",
      firstLine: "",
      lineCount: 0,
      characterCount: 0,
      sourceText: "",
    };
  }

  let parsed: Partial<InitialData>;

  try {
    parsed = JSON.parse(dataElement.textContent) as Partial<InitialData>;
  } catch {
    parsed = {
      sourceText: "",
      fileName: "Invalid initial webview data",
    };
  }

  return {
    fileName: typeof parsed.fileName === "string" ? parsed.fileName : "No active document",
    firstLine: typeof parsed.firstLine === "string" ? parsed.firstLine : "",
    lineCount: typeof parsed.lineCount === "number" ? parsed.lineCount : 0,
    characterCount: typeof parsed.characterCount === "number" ? parsed.characterCount : 0,
    sourceText: typeof parsed.sourceText === "string" ? parsed.sourceText : "",
  };
}
