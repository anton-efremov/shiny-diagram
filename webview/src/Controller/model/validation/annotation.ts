/**
 * @fileoverview Mermaid-expressibility rules for class annotation text.
 */

import { invalid, valid, type ValidationVerdict } from "./verdict";

export function validateAnnotation(
  annotation: string | null,
  className: string
): readonly ValidationVerdict[] {
  if (!annotation || !/\s/.test(annotation)) return [valid("unverified")];

  return [
    invalid(
      `Class "${className}" annotation must not contain whitespace: ${annotation}`,
      "unverified"
    ),
  ];
}
