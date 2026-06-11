/**
 * @fileoverview Manages the live sync session between a .mmd document and its
 * Shiny webview panel. Listens for document changes, debounces them, and pushes
 * updated source to the webview via postMessage. Also receives visual edit
 * messages from the webview and applies them as WorkspaceEdits.
 *
 * Loop prevention: markShinyWrite() is called before every Shiny-originated
 * mutation. The next change event for this document is skipped by the debounce
 * listener. The host then immediately pushes the updated source so the webview
 * model stays in sync without waiting for the debounce.
 */

import * as vscode from "vscode";
import type { HostToWebviewMessage, WebviewToHostMessage } from "./protocol";

const DEBOUNCE_MS = 500;

/**
 * Owns the document↔webview sync loop for one open Shiny panel.
 * Constructed when the panel opens; disposed when the panel closes.
 */
export class DiagramSession {
  private readonly document: vscode.TextDocument;
  private readonly panel: vscode.WebviewPanel;
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  private shinyOriginatedEdit = false;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(document: vscode.TextDocument, panel: vscode.WebviewPanel) {
    this.document = document;
    this.panel = panel;

    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        this.onDocumentChange(event);
      })
    );
  }

  /**
   * Routes an incoming webview message to the appropriate handler.
   * Called by extension.ts via panel.webview.onDidReceiveMessage.
   */
  handleWebviewMessage(msg: WebviewToHostMessage): void {
    if (msg.type === "applyEdits") {
      void this.applyEdits(msg.edits);
    }
  }

  /**
   * Must be called immediately before any Shiny-originated write to the document.
   * Causes the next change event for this document to be treated as non-manual,
   * preventing the webview from receiving its own edit back as a debounced update.
   */
  markShinyWrite(): void {
    this.shinyOriginatedEdit = true;
  }

  /** Releases all listeners and cancels any pending debounce timer. */
  dispose(): void {
    if (this.debounceTimer !== undefined) {
      clearTimeout(this.debounceTimer);
    }
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    if (event.document.uri.toString() !== this.document.uri.toString()) {
      return;
    }

    if (this.shinyOriginatedEdit) {
      this.shinyOriginatedEdit = false;
      return;
    }

    this.scheduleSourcePush();
  }

  private scheduleSourcePush(): void {
    if (this.debounceTimer !== undefined) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.pushSource();
    }, DEBOUNCE_MS);
  }

  private pushSource(): void {
    const message: HostToWebviewMessage = {
      type: "sourceUpdate",
      sourceText: this.document.getText(),
    };
    void this.panel.webview.postMessage(message);
  }

  /**
   * Applies a set of line replacements to the document as a single WorkspaceEdit.
   * Sets the Shiny-write flag before the edit so the doc-change debounce is
   * suppressed, then immediately pushes the updated source to keep the webview
   * model in sync.
   */
  private async applyEdits(
    edits: readonly { lineNumber: number; newText: string }[]
  ): Promise<void> {
    const workspaceEdit = new vscode.WorkspaceEdit();

    for (const edit of edits) {
      const line = this.document.lineAt(edit.lineNumber);
      workspaceEdit.replace(this.document.uri, line.range, edit.newText);
    }

    this.markShinyWrite();
    await vscode.workspace.applyEdit(workspaceEdit);
    this.pushSource();
  }
}
