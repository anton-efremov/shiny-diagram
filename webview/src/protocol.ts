/**
 * @fileoverview Message protocol types for the Shiny host↔webview boundary.
 * Mirrors extension-host/protocol.ts — both sides must be kept in sync
 * manually, as they run in separate runtimes.
 */

// ---------------------------------------------------------------------------
// Host → Webview
// ---------------------------------------------------------------------------

/**
 * Received whenever the active .mmd document changes (debounced), and also
 * immediately after the host applies a Shiny-originated edit.
 */
export type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly sourceText: string;
};

/** Union of all messages the webview can receive from the extension host. */
export type HostMessage = SourceUpdateMessage;

// ---------------------------------------------------------------------------
// Webview → Host
// ---------------------------------------------------------------------------

/**
 * A single line replacement computed by the webview from SourceLocation data.
 * The host applies it verbatim — it has no knowledge of Mermaid syntax.
 */
export type LineEdit = {
  /** 0-indexed line number in the source file. */
  readonly lineNumber: number;
  /** Complete replacement text for that line, without a trailing newline. */
  readonly newText: string;
};

/**
 * Sent when a user visual edit needs to be written back to the source file.
 * The webview computes the exact replacement lines; the host applies them.
 */
export type ApplyEditsMessage = {
  readonly type: "applyEdits";
  readonly edits: readonly LineEdit[];
};

/** Union of all messages the webview sends to the extension host. */
export type WebviewToHostMessage = ApplyEditsMessage;
