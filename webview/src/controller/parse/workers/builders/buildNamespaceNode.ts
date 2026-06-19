/**
 * @fileoverview Builds namespace nodes from namespace tokens.
 */

import { toNamespaceId } from "../../../../shared/ids";
import type { NamespaceNode } from "../../../model/diagramTree";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "../toSourceLocation";

/**
 * Builds a namespace node from a namespace token.
 */
export function buildNamespaceNode(token: ParseToken): NamespaceNode | null {
  if (token.type !== "namespace") return null;

  const match = /^\s*namespace\s+(\w+)/.exec(token.raw);
  if (!match) return null;

  return {
    kind: "namespace",
    id: toNamespaceId(match[1]),
    location: toSourceLocation(token),
  };
}
