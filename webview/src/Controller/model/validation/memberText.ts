/**
 * @fileoverview Mermaid-expressibility rules for class member display text.
 */

import type { MemberKind } from "../../../shared/uml";
import { invalid, valid, type ValidationVerdict } from "./verdict";

export function validateMemberText(
  text: string,
  kind: MemberKind,
  ownerName: string
): readonly ValidationVerdict[] {
  if (kind !== "method") return [valid("verified-accepts")];

  const colonAfterSignature = text.indexOf(":");
  if (colonAfterSignature === -1) return [valid("verified-accepts")];

  const returnType = text.slice(colonAfterSignature + 1);
  if (!returnType.includes(")")) return [valid("verified-accepts")];

  return [
    invalid(
      `Method member in class "${ownerName}" must not contain ")" after the return-type colon: ${text}`,
      "unverified"
    ),
  ];
}
