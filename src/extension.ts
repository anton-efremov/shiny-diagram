import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("shiny.openDiagram", () => {
    const activeDocument = vscode.window.activeTextEditor?.document;
    const panel = vscode.window.createWebviewPanel(
      "shinyDiagram",
      "Shiny Diagram",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out", "webview")]
      }
    );

    panel.webview.html = getWebviewHtml(context, panel.webview, activeDocument);
  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  // No cleanup needed for the initial scaffold.
}

function getWebviewHtml(
  context: vscode.ExtensionContext,
  webview: vscode.Webview,
  document: vscode.TextDocument | undefined
): string {
  const fileName = document ? document.fileName.split(/[\\/]/).pop() ?? document.fileName : "No active document";
  const sourceText = document?.getText() ?? "";
  const firstLine = sourceText.split(/\r?\n/, 1)[0] ?? "";
  const lineCount = document?.lineCount ?? 0;
  const characterCount = sourceText.length;
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "out", "webview", "assets", "index.js"));
  const nonce = getNonce();

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; script-src ${webview.cspSource} 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shiny Diagram</title>
</head>
<body>
  <div
    id="root"
    data-file-name="${escapeHtml(fileName)}"
    data-first-line="${escapeHtml(firstLine)}"
    data-line-count="${lineCount}"
    data-character-count="${characterCount}"
  ></div>
  <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";

  for (let index = 0; index < 32; index += 1) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return nonce;
}
