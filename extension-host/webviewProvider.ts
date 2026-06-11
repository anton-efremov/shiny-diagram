/**
 * @fileoverview Generates the HTML document served to the Shiny webview panel.
 * Handles content security policy, asset URI resolution, nonce generation,
 * and safe serialization of initial data into the page.
 */

import * as vscode from "vscode";

/**
 * Builds the full HTML document for the Shiny webview panel.
 *
 * @param context - Extension context used to resolve local asset URIs.
 * @param webview - Webview instance used to convert URIs and form the CSP source.
 * @param document - Active text document whose content is passed to the webview
 *   as initial data; undefined when no editor is open.
 * @returns Complete HTML string ready to assign to `panel.webview.html`.
 */
export function getWebviewHtml(
  context: vscode.ExtensionContext,
  webview: vscode.Webview,
  document: vscode.TextDocument | undefined
): string {
  const fileName = document
    ? (document.fileName.split(/[\\/]/).pop() ?? document.fileName)
    : "No active document";
  const sourceText = document?.getText() ?? "";
  const firstLine = sourceText.split(/\r?\n/, 1)[0] ?? "";
  const lineCount = document?.lineCount ?? 0;
  const characterCount = sourceText.length;

  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "out", "webview", "assets", "index.js")
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "out", "webview", "assets", "index.css")
  );
  const nonce = getNonce();
  const initialData = serializeJsonForHtml({
    fileName,
    firstLine,
    lineCount,
    characterCount,
    sourceText,
  });

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

/**
 * Generates a pseudorandom nonce string for use in the CSP header.
 * Sufficient for replay prevention within a single webview session.
 */
function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";

  for (let index = 0; index < 32; index += 1) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return nonce;
}

/**
 * Serializes a value to JSON safe for embedding inside an HTML script tag.
 * Escapes characters that would break out of a script context or trigger XSS.
 */
function serializeJsonForHtml(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
