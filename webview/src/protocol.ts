/**
 * @fileoverview Message protocol types for communication from the extension
 * host to the Shiny webview. Mirrors extension-host/protocol.ts — both sides
 * must be kept in sync manually, as they run in separate runtimes.
 */

/**
 * Received whenever the active .mmd document changes and the debounce settles.
 * Carries the full updated source text for a full re-parse.
 */
export type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly sourceText: string;
};

/** Union of all messages the webview can receive from the extension host. */
export type HostMessage = SourceUpdateMessage;
