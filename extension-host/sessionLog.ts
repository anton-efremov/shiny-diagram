/**
 * @fileoverview Owns the development-session log file and formats host and webview entries.
 */

import * as vscode from "vscode";
import type { WebviewLogEntry } from "./protocol";

const LOG_DIRECTORY = ".shiny";
const LOG_FILE = "session.log";

export class SessionLog implements vscode.Disposable {
  private readonly directoryUri: vscode.Uri | null;
  private readonly logUri: vscode.Uri | null;
  private pendingWrite: Promise<void> = Promise.resolve();
  private readonly documents = new Map<string, { version: number; source: string }>();
  private readonly disposables: vscode.Disposable[] = [];

  constructor(workspaceFolder: vscode.WorkspaceFolder | undefined) {
    this.directoryUri = workspaceFolder
      ? vscode.Uri.joinPath(workspaceFolder.uri, LOG_DIRECTORY)
      : null;
    this.logUri = this.directoryUri ? vscode.Uri.joinPath(this.directoryUri, LOG_FILE) : null;
  }

  /** Starts a new activation without erasing prior debugging evidence. */
  async initialize(): Promise<void> {
    if (!this.logUri || !this.directoryUri) return;
    await vscode.workspace.fs.createDirectory(this.directoryUri);
    try {
      await vscode.workspace.fs.stat(this.logUri);
    } catch (error) {
      if (!(error instanceof vscode.FileSystemError) || error.code !== "FileNotFound") throw error;
      await vscode.workspace.fs.writeFile(this.logUri, new Uint8Array());
    }
    await this.append("HOST", `activation ${new Date().toISOString()}`);
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((event) => this.logDocumentChange(event)),
      vscode.workspace.onDidSaveTextDocument((document) => {
        if (this.documents.has(document.uri.toString())) this.logSave(document);
      }),
      vscode.workspace.onDidOpenTextDocument((document) => {
        if (this.documents.has(document.uri.toString())) this.logDocumentOpen(document);
      })
    );
  }

  dispose(): void {
    for (const disposable of this.disposables) disposable.dispose();
  }

  /** Records a document opening and its complete initial source. */
  logDocumentOpen(document: vscode.TextDocument): void {
    const source = document.getText();
    this.documents.set(document.uri.toString(), { version: document.version, source });
    const sourceLines = source.split(/\r?\n/);
    this.appendLines("HOST", [
      `document-open ${document.uri.fsPath}`,
      "initial-source-begin",
      ...sourceLines,
      "initial-source-end",
      `document-snapshot ${JSON.stringify({
        uri: document.uri.toString(),
        version: document.version,
        text: source,
      })}`,
    ]);
  }

  /** Records every applied change once, even while the Shiny panel is closed or hidden. */
  private logDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    const uri = event.document.uri.toString();
    const previous = this.documents.get(uri);
    if (!previous || event.contentChanges.length === 0) return;
    const source = event.document.getText();
    const version = event.document.version;
    this.documents.set(uri, { version, source });
    const reason =
      event.reason === vscode.TextDocumentChangeReason.Undo
        ? "undo"
        : event.reason === vscode.TextDocumentChangeReason.Redo
          ? "redo"
          : "edit";
    this.append(
      "HOST",
      `document-change ${JSON.stringify({
        uri,
        previousVersion: previous.version,
        version,
        reason,
        changes: event.contentChanges.map((change) => ({
          rangeOffset: change.rangeOffset,
          rangeLength: change.rangeLength,
          range: {
            start: { line: change.range.start.line, character: change.range.start.character },
            end: { line: change.range.end.line, character: change.range.end.character },
          },
          removedText: previous.source.slice(
            change.rangeOffset,
            change.rangeOffset + change.rangeLength
          ),
          text: change.text,
        })),
      })}`
    );
  }

  /** Records a save of an open Shiny document. */
  logSave(document: vscode.TextDocument): void {
    this.append("HOST", `save ${document.uri.fsPath}`);
  }

  /** Records one structured entry received from the webview. */
  logWebviewEntry(entry: WebviewLogEntry): void {
    this.append(toLayer(entry), formatWebviewEntry(entry));
  }

  /** Records a user-authored debugging mark. */
  logUserMark(mark: string): void {
    this.append("USER", mark.replace(/\r?\n/g, " "));
  }

  private append(layer: LogLayer, content: string): Promise<void> {
    return this.appendLines(layer, [content]);
  }

  private appendLines(layer: LogLayer, lines: readonly string[]): Promise<void> {
    const logUri = this.logUri;
    if (!logUri) return Promise.resolve();
    const bytes = Buffer.from(
      lines.map((line) => `${toTime()} [${layer}] ${line}\n`).join(""),
      "utf8"
    );
    this.pendingWrite = this.pendingWrite.then(async () => {
      const prior = await vscode.workspace.fs.readFile(logUri);
      await vscode.workspace.fs.writeFile(logUri, Buffer.concat([prior, bytes]));
    });
    return this.pendingWrite;
  }
}

type LogLayer = "HOST" | "BEHAVIOR" | "CONTROLLER" | "USER";

function toLayer(entry: WebviewLogEntry): LogLayer {
  return entry.kind === "action" ? "BEHAVIOR" : "CONTROLLER";
}

function formatWebviewEntry(entry: WebviewLogEntry): string {
  switch (entry.kind) {
    case "action": {
      const values = Object.entries(entry.values).map(
        ([name, value]) => `${name}=${String(value)}`
      );
      return ["action", entry.name, entry.target, ...values].join(" ");
    }
    case "dispatch":
      return `dispatch ${JSON.stringify(entry.commands)}`;
    case "edits": {
      const summaries = entry.edits.map(
        (edit) =>
          `${edit.kind}@${edit.startLine}${edit.endLine === edit.startLine ? "" : `-${edit.endLine}`}`
      );
      return `edits count=${entry.count}${summaries.length > 0 ? ` ${summaries.join(" ")}` : ""}`;
    }
    case "failure":
      return `failure ${entry.stage} ${entry.message.replace(/\r?\n/g, " ")}`;
  }
}

function toTime(): string {
  return new Date().toISOString().slice(11, 23);
}
