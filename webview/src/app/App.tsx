import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { SourceEdit } from "../domain/classDiagram/source/sourceEditTypes";
import type { ApplyEditsMessage, LineEdit } from "./extensionBridge/protocol";
import { readInitialData } from "./extensionBridge/initialData";
import { isHostMessage } from "./extensionBridge/typeGuards";
import { vscode } from "./extensionBridge/vscodeApi";
import EditorCoordinator, {
  type EditorCoordinatorHandle,
  type EditorHeaderState,
} from "../editor/EditorCoordinator";
import AppHeader from "./AppHeader/AppHeader";
import AutorenderView from "./AutorenderView/AutorenderView";
import styles from "./App.module.css";

export type Mode = "autorender" | "editor";

/**
 * Translates the internal SourceEdit union to the host LineEdit protocol.
 * The host currently supports only line replacements; replaceRange collapses
 * to a single-line replacement with embedded newlines (preserving PoC behavior).
 * insertLine and deleteLine are in the union but have no host support yet.
 */
function toLineEdit(edit: SourceEdit): LineEdit | null {
  switch (edit.kind) {
    case "replaceLine":
      return { lineNumber: edit.lineNumber, newText: edit.newText };
    case "replaceRange":
      return { lineNumber: edit.startLine, newText: edit.newText };
    case "insertLine":
    case "deleteLine":
      return null;
  }
}

export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");
  const [sourceText, setSourceText] = useState<string>(readInitialData);
  const [parseStatus, setParseStatus] = useState<EditorHeaderState>({ status: "ready" });
  const coordinatorRef = useRef<EditorCoordinatorHandle>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent<unknown>): void {
      if (!isHostMessage(event.data)) return;
      const msg = event.data;
      if (msg.type === "sourceUpdate") {
        setSourceText(msg.sourceText);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleApplyEdits = useCallback((edits: SourceEdit[]) => {
    const lineEdits = edits.flatMap((e) => {
      const le = toLineEdit(e);
      return le ? [le] : [];
    });
    if (lineEdits.length === 0) return;
    const message: ApplyEditsMessage = { type: "applyEdits", edits: lineEdits };
    vscode.postMessage(message);
  }, []);

  const handleGenerate = useCallback(() => {
    coordinatorRef.current?.dispatch({ type: "generate" });
  }, []);

  return (
    <main className={styles.shell}>
      <AppHeader
        mode={mode}
        setMode={setMode}
        parseStatus={parseStatus}
        onGenerate={handleGenerate}
      />
      {mode === "autorender" ? (
        <AutorenderView sourceText={sourceText} />
      ) : (
        <EditorCoordinator
          ref={coordinatorRef}
          sourceText={sourceText}
          onApplyEdits={handleApplyEdits}
          onHeaderStateChange={setParseStatus}
        />
      )}
    </main>
  );
}
