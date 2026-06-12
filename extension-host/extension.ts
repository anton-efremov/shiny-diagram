/**
 * @fileoverview A mandatory extension's entry point
 * Wires the Shiny VS Code extension: registers commands and sets up the 
 * webview panel lifecycle only. All substantive logic lives in dedicated modules.
 */

import * as vscode from "vscode";
import { getWebviewHtml } from "./webviewProvider";
import { DiagramSession } from "./diagramSession";

/** 
 * A mandatory lifecycle callback that extension.ts must export.
 * Registers extension commands and sets up the webview panel lifecycle. 
 * @param context - a JS object, constructed by Extension server on * extension startup
 *     which contains handles to environment APIs and paths required to run an application
 */
export function activate(context: vscode.ExtensionContext): void {

  /** Registering WebView launch command through VS Code APIs and storing a handle to the open
   * command to push it to clean up queue context.subscriptions (disposable pattern) */
  const openDiagramCommand = vscode.commands.registerCommand("shiny.openDiagram", () => {

    /** Object reference to a document (in-memory representation) in active editor window 
     * at the moment registering the command */
    const activeDocument = vscode.window.activeTextEditor?.document;
    const panel = vscode.window.createWebviewPanel(
      "shinyDiagram",
      "Shiny Diagram",
      vscode.ViewColumn.Beside, // instructs VS Code to split a screen for a webview pane
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out", "webview")], // allowlist of disk resources for webview
      }
    );

    /** Construct "index" page for initial webView loading and providing it via webview handle panel.webview */
    panel.webview.html = getWebviewHtml(context, panel.webview, activeDocument);

    if (activeDocument) {
      const session = new DiagramSession(activeDocument, panel);
      panel.onDidDispose(() => session.dispose()); // Webview cleanup triggered by webview panel closing
    }
  });

  /** Extension host lifecycle: cleanup
   * subsctiptions - a cleanup queue of handles to commands registered with vscode to be disposed on
   * extension host shutdown. Handles expose .dispose() method (disposable pattern) */
  context.subscriptions.push(openDiagramCommand);
}
