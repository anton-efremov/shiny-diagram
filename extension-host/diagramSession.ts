/**
 * @fileoverview Maintains document-to-webview source sync for one open Shiny panel.
 */

import * as vscode from "vscode";
import * as path from "node:path";
import type { HostToWebviewMessage, SourceEdit, WebviewToHostMessage } from "./protocol";

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

    this.disposables.push(
      vscode.workspace.onDidRenameFiles((event) => {
        const rename = event.files.find(
          ({ oldUri }) => oldUri.toString() === this.document.uri.toString()
        );
        if (rename) this.pushSourceUpdate(path.basename(rename.newUri.fsPath));
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
      return;
    }

    if (this.document.isClosed) return;
    void vscode.commands.executeCommand(msg.type === "history.undo" ? "undo" : "redo");
  }

  /**
   * Applies a set of range replacements to the document as a single transaction.
   */
  private async onApplyEdits(edits: readonly SourceEdit[]): Promise<void> {
    const workspaceEdit = new vscode.WorkspaceEdit();

    for (const edit of edits) {
      const range = new vscode.Range(
        new vscode.Position(edit.start.line, edit.start.character),
        new vscode.Position(edit.end.line, edit.end.character)
      );
      workspaceEdit.replace(this.document.uri, range, edit.replacementText);
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

  private pushSourceUpdate(documentName = path.basename(this.document.fileName)): void {
    const message: HostToWebviewMessage = {
      type: "sourceUpdate",
      sourceText: this.document.getText(),
      documentName,
    };
    void this.panel.webview.postMessage(message);
  }
}
