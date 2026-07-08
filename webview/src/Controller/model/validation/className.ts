/**
 * @fileoverview Mermaid-expressibility rules for class names and generic type text.
 */

import { invalid, valid, type ValidationVerdict } from "./verdict";

export function validateClassGenericType(
  genericType: string | null,
  className: string
): readonly ValidationVerdict[] {
  if (!genericType?.includes(",")) return [valid("unverified")];

  return [
    invalid(
      `Class "${className}" generic type must not contain a comma: ${genericType}`,
      "unverified"
    ),
  ];
}
