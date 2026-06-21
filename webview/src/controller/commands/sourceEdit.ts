/**
 * @fileoverview Source edit operations produced by commands for host application.
 */

export type SourceEdit =
  | {
      readonly kind: "replaceLine";
      readonly lineNumber: number;
      readonly newText: string;
    }
  | {
      readonly kind: "insertLine";
      readonly lineNumber: number;
      readonly newText: string;
    }
  | {
      readonly kind: "deleteLine";
      readonly lineNumber: number;
    }
  | {
      readonly kind: "replaceRange";
      readonly startLine: number;
      readonly endLine: number;
      readonly newText: string;
    };
