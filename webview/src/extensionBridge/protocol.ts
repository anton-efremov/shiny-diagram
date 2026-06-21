/**
 * @fileoverview Message contracts exchanged between the Extension Bridge and host.
 */

export type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly sourceText: string;
};

export type HostToWebviewMessage = SourceUpdateMessage;

/**
 * Line-level edit sent to the extension host.
 */
export type LineEdit = {
  readonly lineNumber: number;
  readonly newText: string;
};

export type ApplyEditsMessage = {
  readonly type: "applyEdits";
  readonly edits: readonly LineEdit[];
};

export type WebviewToHostMessage = ApplyEditsMessage;
