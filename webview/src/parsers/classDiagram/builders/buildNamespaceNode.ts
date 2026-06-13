/**
 * @fileoverview Builds NamespaceNode values from namespace parse tokens.
 */

import type { NamespaceNode } from "../../../models/classDiagram/diagramTreeModel";
import { toNamespaceId } from "../../../models/classDiagram/primitives";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "./toSourceLocation";

/**
 * Builds a NamespaceNode from a namespace token.
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
