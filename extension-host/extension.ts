/**
 * @fileoverview Registers the Shiny VS Code command and webview panel lifecycle.
 */

import * as vscode from "vscode";
import { getWebviewHtml } from "./webviewProvider";
import { DiagramSession } from "./diagramSession";

/**
 * Activates the extension and registers its commands.
 */
export function activate(context: vscode.ExtensionContext): void {
  const openDiagramCommand = vscode.commands.registerCommand("shiny.openDiagram", () => {
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

    if (activeDocument) {
      const session = new DiagramSession(activeDocument, panel);
      panel.onDidDispose(() => session.dispose());
    }
  });

  context.subscriptions.push(openDiagramCommand);
}
