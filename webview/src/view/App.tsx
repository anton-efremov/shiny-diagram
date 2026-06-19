import { useState } from "react";
import type { ReactElement } from "react";
import { useEditorState } from "./contexts/EditorStateContext";
import AppHeader from "./AppHeader/AppHeader";
import AutorenderView from "./AutorenderView/AutorenderView";
import EditorView from "./EditorView/EditorView";
import styles from "./App.module.css";

export type Mode = "autorender" | "editor";

export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");
  const { sourceText, parseStatus } = useEditorState();

  return (
    <main className={styles.shell}>
      <AppHeader mode={mode} setMode={setMode} parseStatus={parseStatus} />
      {mode === "autorender" ? (
        <AutorenderView sourceText={sourceText} />
      ) : (
        <EditorView />
      )}
    </main>
  );
}
