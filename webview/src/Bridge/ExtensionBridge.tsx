/**
 * @fileoverview Coordinates host messaging and mounts the Webview Shell.
 */

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { SourceEdit as ControllerSourceEdit } from "../Controller/model/sourceEdit";
import type {
  ApplyEditsMessage,
  HistoryMessage,
  SourceEdit as ProtocolSourceEdit,
} from "./protocol";
import { readInitialData } from "./initialData";
import { isHostMessage } from "./typeGuards";
import { vscode } from "./vscodeApi";
import { WebViewShell } from "../Shell";

function toProtocolEdit(edit: ControllerSourceEdit): ProtocolSourceEdit {
  return {
    start: { line: edit.start.line, character: edit.start.character },
    end: { line: edit.end.line, character: edit.end.character },
    replacementText: edit.replacementText,
  };
}

/**
 * Owns webview source state and dispatches source edits to the extension host.
 */
export default function ExtensionBridge(): ReactElement {
  const [documentSnapshot, setDocumentSnapshot] = useState(readInitialData);

  useEffect(() => {
    function handleMessage(event: MessageEvent<unknown>): void {
      if (!isHostMessage(event.data)) return;
      const msg = event.data;
      if (msg.type === "sourceUpdate") {
        setDocumentSnapshot({ sourceText: msg.sourceText, documentName: msg.documentName });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleApplyEdits = useCallback((edits: ControllerSourceEdit[]) => {
    if (edits.length === 0) return;
    const message: ApplyEditsMessage = { type: "applyEdits", edits: edits.map(toProtocolEdit) };
    vscode.postMessage(message);
  }, []);

  const handleHistory = useCallback((action: "undo" | "redo") => {
    const message: HistoryMessage = { type: `history.${action}` };
    vscode.postMessage(message);
  }, []);

  return (
    <WebViewShell
      sourceText={documentSnapshot.sourceText}
      documentName={documentSnapshot.documentName}
      onApplyEdits={handleApplyEdits}
      onHistory={handleHistory}
    />
  );
}
