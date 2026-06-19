/**
 * @fileoverview Source ranges attached to parsed diagram constructs.
 */

export type SourceLocation = {
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
  readonly raw: string;
};
