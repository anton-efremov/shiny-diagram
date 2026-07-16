/**
 * @fileoverview Message protocol types for the Shiny host <-> webview boundary.
 */

/**
 * Carries the current document source from the host to the webview.
 */
export type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly sourceText: string;
  readonly documentName: string;
};

/** Union of all messages the extension host sends to the webview. */
export type HostToWebviewMessage = SourceUpdateMessage;

export type SourcePosition = {
  readonly line: number;
  readonly character: number;
};

/**
 * A single range replacement in the active .mmd file.
 */
export type SourceEdit = {
  readonly start: SourcePosition;
  readonly end: SourcePosition;
  readonly replacementText: string;
};

/**
 * Requests source edits from a visual webview interaction.
 */
export type ApplyEditsMessage = {
  readonly type: "applyEdits";
  readonly edits: readonly SourceEdit[];
};

/** Requests a native history command for the custom text editor document. */
export type HistoryMessage = {
  readonly type: "history.undo" | "history.redo";
};

/** Union of all messages the webview sends to the extension host. */
export type WebviewToHostMessage = ApplyEditsMessage | HistoryMessage;
