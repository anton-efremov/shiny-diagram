/**
 * @fileoverview Builds namespace nodes from namespace tokens.
 */

import { toNamespaceId } from "../../../../shared/ids";
import type { NamespaceNode } from "../../../model/diagramGraph";
import type { SourceLocation } from "../../../model/sourceLocation";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "../toSourceLocation";

export type ParsedNamespaceNode = {
  readonly node: NamespaceNode;
  readonly location: SourceLocation;
};

/**
 * Builds a namespace node from a namespace token.
 */
export function buildNamespaceNode(token: ParseToken): ParsedNamespaceNode | null {
  if (token.type !== "namespace") return null;

  const match = /^\s*namespace\s+(\w+)/.exec(token.raw);
  if (!match) return null;

  const id = toNamespaceId(match[1]);
  return {
    location: toSourceLocation(token),
    node: {
      kind: "namespace",
      id,
      name: id,
      label: id,
      parentNamespaceId: null,
      spatial: null,
    },
  };
}
