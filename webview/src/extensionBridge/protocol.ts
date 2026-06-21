/**
 * @fileoverview Message contracts exchanged between the Extension Bridge and host.
 */

export type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly sourceText: string;
};

export type HostToWebviewMessage = SourceUpdateMessage;

export type SourcePosition = {
  readonly line: number;
  readonly character: number;
};

export type SourceEdit = {
  readonly start: SourcePosition;
  readonly end: SourcePosition;
  readonly replacementText: string;
};

export type ApplyEditsMessage = {
  readonly type: "applyEdits";
  readonly edits: readonly SourceEdit[];
};

export type WebviewToHostMessage = ApplyEditsMessage;
