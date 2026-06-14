/**
 * @fileoverview Root application component. Owns mode and live source state,
 * parses the source into a DiagramTree, and renders the app shell.
 */

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { Mode } from "./types";
import { parseDiagram } from "./parsers/classDiagram";
import type { ParseResult } from "./parsers/classDiagram";
import { readInitialData } from "./utils/initialData";
import { isHostMessage } from "./utils/typeGuards";
import AppHeader from "./components/AppHeader/AppHeader";
import AutorenderView from "./components/AutorenderView/AutorenderView";
import EditorView from "./components/EditorView/EditorView";
import styles from "./App.module.css";

/** Root application component. Owns mode and live source state. */
export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");
  const [sourceText, setSourceText] = useState<string>(readInitialData);

  useEffect(() => {
    function handleMessage(event: MessageEvent<unknown>): void {
      // Defined inside useEffect so it is created once on mount
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

  return (
    <main className={styles.shell}>
      <AppHeader mode={mode} setMode={setMode} parseResult={parseResult} sourceText={sourceText} />
      {mode === "autorender" ? (
        <AutorenderView sourceText={sourceText} />
      ) : (
        <EditorView parseResult={parseResult} />
      )}
    </main>
  );
}
