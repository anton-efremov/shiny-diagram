/**
 * @fileoverview Source edit operations produced by Controller writeback.
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
