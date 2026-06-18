import { useState } from "react";
import type { ReactElement } from "react";
import type { SourceEdit } from "../controller/source/sourceEditTypes";
import type { Mode } from "../controller/AppController";
import AppController from "../controller/AppController";
import styles from "./App.module.css";

type ViewAppProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};

export default function ViewApp({ sourceText, onApplyEdits }: ViewAppProps): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");

  return (
    <main className={styles.shell}>
      <AppController
        sourceText={sourceText}
        onApplyEdits={onApplyEdits}
        mode={mode}
        onModeChange={setMode}
      />
    </main>
  );
}
