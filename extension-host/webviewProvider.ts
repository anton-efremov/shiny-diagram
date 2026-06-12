/**
 * @fileoverview Generates the HTML document served to the Shiny webview panel.
 * Handles content security policy, asset URI resolution, nonce generation,
 * and safe serialization of initial source text into the page.
 */

import * as vscode from "vscode";

/**
 * Builds the full HTML document for the Shiny webview panel.
 *
 * @param context - Extension host environment handle; owns resource paths, storage, and the extension's own URI on disk
 * @param webview - The active handle to the webview; provides unique APIs required to manage that specific sandbox's security, communication, and resource routing.
 * @param document - Reference to the VS Code editor's in-memory representation of an open file; kept in sync with disk by the editor.
 * @returns Complete HTML string ready to assign to `panel.webview.html`.
 */
export function getWebviewHtml(
  context: vscode.ExtensionContext,
  webview: vscode.Webview,
  document: vscode.TextDocument | undefined
): string {
  const sourceText = document?.getText() ?? "";

  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "out", "webview", "assets", "index.js")
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "out", "webview", "assets", "index.css")
  );

  /** Random token that "signs" the legitimate script tag. Prevents injection attack —
    *  user-controlled data (diagram source) being interpreted as executable script. */
  const nonce = getNonce();
  const initialData = serializeJsonForHtml(sourceText);

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; script-src ${webview.cspSource} 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${styleUri}">
  <title>Shiny Diagram</title>
</head>
<body>
  <script id="shiny-initial-data" type="application/json">${initialData}</script>
  <div id="root"></div>
  <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let index = 0; index < 32; index += 1) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

function serializeJsonForHtml(value: unknown): string {
  const ls = String.fromCharCode(0x2028);
  const ps = String.fromCharCode(0x2029);
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp(ls, "g"), "\\u2028")
    .replace(new RegExp(ps, "g"), "\\u2029");
}
