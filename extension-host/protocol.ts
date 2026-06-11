/**
 * @fileoverview Message protocol types for the Shiny host↔webview boundary.
 * All messages cross the postMessage boundary as JSON with a `type` discriminant.
 *
 * The webview-side mirror of these types lives in webview/src/protocol.ts.
 * Both sides must be kept in sync manually — there is no shared runtime.
 */

// ---------------------------------------------------------------------------
// Host → Webview
// ---------------------------------------------------------------------------

/**
 * Sent whenever the active .mmd document changes and the debounce has settled,
 * and also immediately after the host applies a Shiny-originated edit so the
 * webview model stays in sync without a second round-trip.
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
 * A single line replacement computed by the webview using SourceLocation data.
 * The host applies it verbatim — it has no knowledge of Mermaid syntax.
 */
export type LineEdit = {
  /** 0-indexed line number in the source file. */
  readonly lineNumber: number;
  /** Complete replacement text for that line, without a trailing newline. */
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
