import { useCallback, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { SourceEdit } from "../controller/source/sourceEditTypes";
import type { EditorHeaderState } from "../controller/AppController";
import AppController, { type AppControllerHandle } from "../controller/AppController";
import AppHeader from "./AppHeader/AppHeader";
import AutorenderView from "./AutorenderView/AutorenderView";
import styles from "./App.module.css";

export type Mode = "autorender" | "editor";

type ViewAppProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};

export default function ViewApp({ sourceText, onApplyEdits }: ViewAppProps): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");
  const [parseStatus, setParseStatus] = useState<EditorHeaderState>({ status: "ready" });
  const controllerRef = useRef<AppControllerHandle>(null);

  const handleGenerate = useCallback(() => {
    controllerRef.current?.dispatch({ type: "generate" });
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
        <AppController
          ref={controllerRef}
          sourceText={sourceText}
          onApplyEdits={onApplyEdits}
          onHeaderStateChange={setParseStatus}
        />
      )}
    </main>
  );
}
