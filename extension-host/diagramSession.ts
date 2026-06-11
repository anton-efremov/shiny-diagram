/**
 * @fileoverview Manages the live sync session between a .mmd document and its
 * Shiny webview panel. Listens for document changes, debounces them, and pushes
 * updated source to the webview via postMessage.
 *
 * Loop prevention: call markShinyWrite() immediately before any Shiny-originated
 * source mutation. The next change event for this document will be skipped,
 * preventing the webview from receiving its own edit back as an external update.
 */

import * as vscode from "vscode";
import type { HostToWebviewMessage } from "./protocol";

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
   * Must be called immediately before any Shiny-originated write to the document.
   * Causes the next change event for this document to be treated as non-manual,
   * preventing the webview from receiving its own edit back as an update.
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
}
