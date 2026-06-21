/**
 * @fileoverview Coordinates host messaging between VS Code and the React webview.
 */

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { SourceEdit } from "../controller/commands";
import type { ApplyEditsMessage, LineEdit } from "./protocol";
import { readInitialData } from "./initialData";
import { isHostMessage } from "./typeGuards";
import { vscode } from "./vscodeApi";
import AppController from "../controller/AppController";

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

/**
 * Owns webview source state and dispatches source edits to the extension host.
 */
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
