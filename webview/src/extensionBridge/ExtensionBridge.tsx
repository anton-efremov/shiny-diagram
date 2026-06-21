/**
 * @fileoverview Coordinates host messaging between VS Code and the React webview.
 */

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { SourceEdit as ControllerSourceEdit } from "../controller/commands";
import type { ApplyEditsMessage, SourceEdit as ProtocolSourceEdit } from "./protocol";
import { readInitialData } from "./initialData";
import { isHostMessage } from "./typeGuards";
import { vscode } from "./vscodeApi";
import AppController from "../controller/AppController";

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

  const handleApplyEdits = useCallback((edits: ControllerSourceEdit[]) => {
    if (edits.length === 0) return;
    const message: ApplyEditsMessage = { type: "applyEdits", edits: edits.map(toProtocolEdit) };
    vscode.postMessage(message);
  }, []);

  return <AppController sourceText={sourceText} onApplyEdits={handleApplyEdits} />;
}
