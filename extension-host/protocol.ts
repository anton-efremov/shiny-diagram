/**
 * @fileoverview Message protocol types for the Shiny host <-> webview boundary.
 */

/**
 * Carries the current document source from the host to the webview.
 */
export type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly sourceText: string;
};

/** Union of all messages the extension host sends to the webview. */
export type HostToWebviewMessage = SourceUpdateMessage;

/**
 * A single line replacement in the active .mmd file.
 */
export type LineEdit = {
  readonly lineNumber: number;
  readonly newText: string;
};

/**
 * Requests source edits from a visual webview interaction.
 */
export type ApplyEditsMessage = {
  readonly type: "applyEdits";
  readonly edits: readonly LineEdit[];
};

/** Union of all messages the webview sends to the extension host. */
export type WebviewToHostMessage = ApplyEditsMessage;
