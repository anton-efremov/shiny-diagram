/**
 * @fileoverview Message protocol types for communication from the extension
 * host to the Shiny webview. All messages cross the postMessage boundary as
 * JSON with a `type` discriminant field.
 *
 * The webview-side mirror of these types lives in webview/src/protocol.ts.
 * Both sides must be kept in sync manually — there is no shared runtime.
 */

/**
 * Sent whenever the active .mmd document changes and the debounce has settled.
 * Carries the full updated source text; the webview re-parses from scratch.
 */
export type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly sourceText: string;
};

/** Union of all messages the extension host sends to the webview. */
export type HostToWebviewMessage = SourceUpdateMessage;
