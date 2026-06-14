/**
 * @fileoverview Root application component. Owns mode and live source state,
 * parses the source into a DiagramTree, and renders the app shell.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { computeGenerateEdits } from "./formatters/classDiagram/computeGenerateEdits";
import { parseDiagram } from "./parsers/classDiagram";
import type { ParseResult } from "./parsers/classDiagram";
import type { ApplyEditsMessage } from "./extensionBridge/protocol";
import { readInitialData } from "./extensionBridge/initialData";
import { isHostMessage } from "./extensionBridge/typeGuards";
import { vscode } from "./extensionBridge/vscodeApi";
import AppHeader from "./components/AppHeader/AppHeader";
import AutorenderView from "./components/AutorenderView/AutorenderView";
import EditorView from "./components/EditorView/EditorView";
import styles from "./App.module.css";

export type Mode = "autorender" | "editor";

/** Root application component. Owns mode and live source state. */
export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");
  const [sourceText, setSourceText] = useState<string>(readInitialData);

  // Setting source text receiving pipeline through window event
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

  const parseResult: ParseResult = useMemo(() => parseDiagram(sourceText), [sourceText]);

  const handleGenerate = useCallback(() => {
    if (parseResult.ok || parseResult.error !== "missingAnnotations") return;
    const edits = computeGenerateEdits(
      parseResult.model,
      parseResult.missingIds,
      parseResult.malformedAnnotations,
      sourceText
    );
    if (edits.length === 0) return;
    const message: ApplyEditsMessage = { type: "applyEdits", edits };
    vscode.postMessage(message);
  }, [parseResult, sourceText]);

  return (
    <main className={styles.shell}>
      <AppHeader
        mode={mode}
        setMode={setMode}
        parseResult={parseResult}
        onGenerate={handleGenerate}
      />
      {mode === "autorender" ? (
        <AutorenderView sourceText={sourceText} />
      ) : (
        <EditorView parseResult={parseResult} />
      )}
    </main>
  );
}
