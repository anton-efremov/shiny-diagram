import { useState } from "react";
import type { ReactElement } from "react";
import { useEditorState } from "../contexts/EditorStateContext";
import AppHeader from "./AppHeader/AppHeader";
import AutorenderView from "./AutorenderView/AutorenderView";
import EditorView from "./EditorView/EditorView";
import { defaultAppMode, type AppMode } from "./state";
import styles from "./App.module.css";

/**
 * Renders the webview shell with autorender and editor modes.
 */
export default function App(): ReactElement {
  const [mode, setMode] = useState<AppMode>(defaultAppMode);
  const { sourceText, parseStatus } = useEditorState();

  return (
    <main className={styles.shell}>
      <AppHeader mode={mode} setMode={setMode} parseStatus={parseStatus} />
      {mode === "autorender" ? <AutorenderView sourceText={sourceText} /> : <EditorView />}
    </main>
  );
}
