/**
 * @fileoverview Wires the Shiny VS Code extension: registers commands and sets
 * up the webview panel lifecycle. All substantive logic lives in dedicated modules.
 */

import * as vscode from "vscode";
import { getWebviewHtml } from "./webviewProvider";

/** Registers extension commands and sets up the webview panel lifecycle. */
export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("shiny.openDiagram", () => {
    const activeDocument = vscode.window.activeTextEditor?.document;
    const panel = vscode.window.createWebviewPanel(
      "shinyDiagram",
      "Shiny Diagram",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out", "webview")],
      }
    );

    panel.webview.html = getWebviewHtml(context, panel.webview, activeDocument);
  });

  context.subscriptions.push(disposable);
}

/** No cleanup required on deactivation. */
export function deactivate(): void {}
