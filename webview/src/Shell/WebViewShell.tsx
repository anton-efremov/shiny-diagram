import { useState } from "react";
import type { ReactElement } from "react";
import type { SourceEdit } from "../Controller/model/sourceEdit";
import ShinyController from "../Controller/ShinyController";
import MermaidRenderer from "../mermaidRenderer/MermaidRenderer";
import WebViewHeader from "./WebViewHeader/WebViewHeader";
import { defaultWebViewMode, type WebViewMode } from "./state";
import styles from "./WebViewShell.module.css";

type WebViewShellProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};

/**
 * Owns product-level mode selection and mounts the selected webview branch.
 */
export default function WebViewShell({
  sourceText,
  onApplyEdits,
}: WebViewShellProps): ReactElement {
  const [mode, setMode] = useState<WebViewMode>(defaultWebViewMode);

  return (
    <main className={styles.shell}>
      <WebViewHeader mode={mode} onModeChange={setMode} />
      {mode === "mermaid" ? (
        <MermaidRenderer sourceText={sourceText} />
      ) : (
        <ShinyController sourceText={sourceText} onApplyEdits={onApplyEdits} />
      )}
    </main>
  );
}
