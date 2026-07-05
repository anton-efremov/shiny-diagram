/**
 * @fileoverview Builds namespace nodes from namespace tokens.
 */

import { toNamespaceId } from "../../../../shared/ids";
import type { NamespaceNode } from "../../../model/diagramGraph";
import type { SourceSpan } from "../../../model/sourceEdit";
import type { ParseToken } from "../tokenizer";
import { toSourceSpan } from "../toSourceSpan";

export type ParsedNamespaceNode = {
  readonly node: NamespaceNode;
  readonly location: SourceSpan;
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
    location: toSourceSpan(token),
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
