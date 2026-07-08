/**
 * @fileoverview Builds namespace nodes from namespace tokens.
 */

import { toNamespaceId } from "../../../../shared/ids";
import { IDENTITY_PATTERN, readIdentity } from "../../../model/identitySpelling";
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

  const match = new RegExp(`^\\s*namespace\\s+(${IDENTITY_PATTERN})`).exec(token.raw);
  if (!match) return null;

  const identity = readIdentity(match[1]);
  const id = toNamespaceId(identity);
  return {
    location: toSourceSpan(token),
    node: {
      kind: "namespace",
      id,
      name: identity,
      label: identity,
      parentNamespaceId: null,
      spatial: null,
    },
  };
}
