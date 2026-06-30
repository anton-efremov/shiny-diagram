/**
 * @fileoverview Source edit operations produced by commands for host application.
 */

export type SourcePosition = {
  readonly line: number;
  readonly character: number;
};

export type SourceEdit = {
  readonly start: SourcePosition;
  readonly end: SourcePosition;
  readonly replacementText: string;
};
