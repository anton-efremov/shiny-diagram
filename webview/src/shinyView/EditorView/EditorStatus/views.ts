/**
 * @fileoverview Render contract for editor status.
 */

export type EditorStatusView =
  | {
      readonly status: "ready";
    }
  | {
      readonly status: "invalidSyntax";
      readonly message: string;
    }
  | {
      readonly status: "missingAnnotations";
    };
