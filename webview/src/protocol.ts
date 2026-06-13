/**
 * @fileoverview Message protocol types for the Shiny host <-> webview boundary.
 * All messages cross the postMessage boundary as JSON.
 *
 * Duplicated in extension-host/protocol.ts to keep both host and webview bound to
 * their respective folder without shared files.
 */

// ---------------------------------------------------------------------------
// Host → Webview
// ---------------------------------------------------------------------------

/**
 * Contains the whole source code; sent when:
 * 1. User changes active .mmd document and the debounce settled.
 * 2. The host just processed a Shiny-originated edit and immediately pushes
 *    the updated source back to sync with webview  without waiting for the debounce.
 */
export type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly sourceText: string;
};

/** Union of all messages the extension host sends to the webview. */
export type HostToWebviewMessage = SourceUpdateMessage;

// ---------------------------------------------------------------------------
// Webview → Host
// ---------------------------------------------------------------------------

/**
 * A single line replacement in the active .mmd file.
 * Replaces the entire line at lineNumber with newText.
 */
export type LineEdit = {
  readonly lineNumber: number;
  readonly newText: string;
};

/**
 * Sent by the webview when a user visual edit (drag, color change) needs to
 * be written back to the source file. The host applies each edit in order.
 */
export type ApplyEditsMessage = {
  readonly type: "applyEdits";
  readonly edits: readonly LineEdit[];
};

/** Union of all messages the webview sends to the extension host. */
export type WebviewToHostMessage = ApplyEditsMessage;
