import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { SourceEdit } from "../primitives";
import type { ApplyEditsMessage, LineEdit } from "./protocol";
import { readInitialData } from "./initialData";
import { isHostMessage } from "./typeGuards";
import { vscode } from "./vscodeApi";
import AppController from "../controller/AppController";

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

export default function ExtensionBridge(): ReactElement {
  const [sourceText, setSourceText] = useState<string>(readInitialData);

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

  return <AppController sourceText={sourceText} onApplyEdits={handleApplyEdits} />;
}
