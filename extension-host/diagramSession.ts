/**
 * @fileoverview Maintains document-to-webview source sync for one open Shiny panel.
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

  constructor(document: vscode.TextDocument, panel: vscode.WebviewPanel) {
    this.document = document;
    this.panel = panel;

    this.disposables.push(
      panel.webview.onDidReceiveMessage((msg: WebviewToHostMessage) => {
        this.handleWebviewMessage(msg);
      })
    );

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
    const workspaceEdit = new vscode.WorkspaceEdit();

    for (const edit of edits) {
      const line = this.document.lineAt(edit.lineNumber);
      workspaceEdit.replace(this.document.uri, line.range, edit.newText);
    }

    // Marks this edit as Shiny-originated so the resulting onDidChangeTextDocument
    // event is skipped rather than triggering a debounced push back to the webview.
    // Note: not race-condition safe if a user edit and a Shiny edit land in the same
    // event loop tick. Safe in practice but worth revisiting if sync issues arise.
    this.shinyOriginatedEdit = true;

    await vscode.workspace.applyEdit(workspaceEdit);
    this.pushSourceUpdate();
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
