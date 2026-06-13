/**
 * @fileoverview Contains class definition for a session object — a stateful collection of
 * event handlers that maintains document <-> webview source sync for one open Shiny panel.
 * Listeners are registered in the constructor and released in dispose().
 * Holds debounce and loop-prevention state shared across those handlers.
 * Instantiated when the panel opens; disposed when the panel closes.
 */

import * as vscode from "vscode";
import type { HostToWebviewMessage, WebviewToHostMessage } from "./protocol";

const DEBOUNCE_MS = 500;

export class DiagramSession {
  private readonly document: vscode.TextDocument;
  private readonly panel: vscode.WebviewPanel;
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly disposables: vscode.Disposable[] = [];
  private shinyOriginatedEdit = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  constructor(document: vscode.TextDocument, panel: vscode.WebviewPanel) {
    this.document = document;
    this.panel = panel;

    // Registers an event listener and stores its token for disposal on panel closing
    this.disposables.push(
      panel.webview.onDidReceiveMessage((msg: WebviewToHostMessage) => {
        this.handleWebviewMessage(msg);
      })
    );

    // Registers an event listener and stores its token for disposal on panel closing
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        this.onDocumentChange(event);
      })
    );
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

  // ── Webview message handling ─────────────────────────────────────────────

  /**
   * Routes an incoming webview message to the appropriate handler.
   */
  handleWebviewMessage(msg: WebviewToHostMessage): void {
    if (msg.type === "applyEdits") {
      void this.onApplyEdits(msg.edits);
    }
  }

  /**
   * Applies a set of line replacements to the document as a single transaction.
   */
  private async onApplyEdits(
    edits: readonly { lineNumber: number; newText: string }[]
  ): Promise<void> {
    // a transaction object for edits accumulation and application
    const workspaceEdit = new vscode.WorkspaceEdit();

    for (const edit of edits) {
      const line = this.document.lineAt(edit.lineNumber);
      workspaceEdit.replace(this.document.uri, line.range, edit.newText); // accumulate edits in transaction object
    }

    // Marks this edit as Shiny-originated so the resulting onDidChangeTextDocument
    // event is skipped rather than triggering a debounced push back to the webview.
    // Note: not race-condition safe if a user edit and a Shiny edit land in the same
    // event loop tick. Safe in practice but worth revisiting if sync issues arise.
    this.shinyOriginatedEdit = true;

    // apply edits as a single transaction
    await vscode.workspace.applyEdit(workspaceEdit);
    this.pushSourceUpdate();
  }

  // ── Document change handling ─────────────────────────────────────────────

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
      this.pushSourceUpdate();
    }, DEBOUNCE_MS);
  }

  private pushSourceUpdate(): void {
    const message: HostToWebviewMessage = {
      type: "sourceUpdate",
      sourceText: this.document.getText(),
    };
    void this.panel.webview.postMessage(message);
  }
}
