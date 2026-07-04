/**
 * @fileoverview Source coordinates and edit operations used by Controller writeback.
 */

export type SourcePosition = {
  readonly line: number;
  readonly character: number;
};

export type SourceSpan = {
  readonly start: SourcePosition;
  readonly end: SourcePosition;
};

export type SourceEdit = {
  readonly start: SourcePosition;
  readonly end: SourcePosition;
  readonly replacementText: string;
};
