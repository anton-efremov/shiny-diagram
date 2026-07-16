/**
 * @behavior Product mode and document-status state ownership.
 * @render Header and active document rendering branch.
 */

import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import type { SourceEdit } from "../Controller/model/sourceEdit";
import ShinyController from "../Controller/ShinyController";
import MermaidRenderer from "../mermaidRenderer/MermaidRenderer";
import FallbackSurface from "./FallbackSurface/FallbackSurface";
import WebViewHeader from "./WebViewHeader/WebViewHeader";
import {
  defaultDocumentStatus,
  defaultWebViewMode,
  type DocumentStatus,
  type WebViewMode,
} from "./state";
import styles from "./WebViewShell.module.css";

type WebViewShellProps = {
  sourceText: string;
  documentName: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
  onHistory: (action: "undo" | "redo") => void;
};

/**
 * Owns product-level mode selection and mounts the selected webview branch.
 */
export default function WebViewShell({
  sourceText,
  documentName,
  onApplyEdits,
  onHistory,
}: WebViewShellProps): ReactElement {
  // State creation: local product mode and document status
  const [mode, setMode] = useState<WebViewMode>(defaultWebViewMode);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>(defaultDocumentStatus);
  const [generateRequest, setGenerateRequest] = useState(0);

  // Event handler props derivation
  const onStatusChange = useCallback((status: DocumentStatus) => {
    setDocumentStatus(status);
  }, []);
  const onGenerate = useCallback(() => {
    setGenerateRequest((request) => request + 1);
  }, []);

  // Child component routing
  const documentSurface =
    mode === "mermaid" && documentStatus.status !== "invalidSyntax" ? (
      <MermaidRenderer sourceText={sourceText} />
    ) : documentStatus.status !== "ready" ? (
      <FallbackSurface documentStatus={documentStatus} />
    ) : null;

  return (
    <main className={styles.shell}>
      <WebViewHeader
        mode={mode}
        documentName={documentName}
        documentStatus={documentStatus}
        onModeChange={setMode}
        onHistory={onHistory}
        onGenerate={onGenerate}
      />
      {documentSurface}
      <ShinyController
        sourceText={sourceText}
        onApplyEdits={onApplyEdits}
        onStatusChange={onStatusChange}
        generateRequest={generateRequest}
        visible={mode === "shiny" || documentStatus.status !== "ready"}
      />
    </main>
  );
}
