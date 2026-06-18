export type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly sourceText: string;
};

export type HostToWebviewMessage = SourceUpdateMessage;

/**
 * Line-level edit sent to the extension host. Replaces the line at lineNumber
 * with newText. newText may contain embedded newlines for multi-line replacement.
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
