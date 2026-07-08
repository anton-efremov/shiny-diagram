/**
 * @fileoverview Builds namespace nodes from namespace tokens.
 */

import { toNamespaceId, type NamespaceId } from "../../../../shared/ids";
import { IDENTITY_PATTERN, readIdentity } from "../../../model/identitySpelling";
import type { NamespaceNode } from "../../../model/diagramGraph";
import type { SourceSpan } from "../../../model/sourceEdit";
import type { ParseToken } from "../tokenizer";
import { toSourceSpan } from "../toSourceSpan";

export type ParsedNamespaceNode = {
  readonly nodes: readonly NamespaceNode[];
  readonly explicitNode: NamespaceNode;
  readonly location: SourceSpan;
};

/**
 * Builds a namespace node from a namespace token.
 */
export function buildNamespaceNode(
  token: ParseToken,
  parentNamespaceId: NamespaceId | null
): ParsedNamespaceNode | null {
  if (token.type !== "namespace") return null;

  const match = new RegExp(`^\\s*namespace\\s+(${IDENTITY_PATTERN})`).exec(token.raw);
  if (!match) return null;

  const identity = readIdentity(match[1]);
  const qualifiedIdentity = parentNamespaceId ? `${parentNamespaceId}.${identity}` : identity;
  const nodes = toNamespaceNodes(qualifiedIdentity);
  const explicitNode = nodes.at(-1);
  if (!explicitNode) return null;

  return {
    location: toSourceSpan(token),
    nodes,
    explicitNode,
  };
}

function toNamespaceNodes(qualifiedIdentity: string): readonly NamespaceNode[] {
  const parts = qualifiedIdentity.split(".");
  return parts.map((part, index) => {
    const id = toNamespaceId(parts.slice(0, index + 1).join("."));
    const parentNamespaceId = index === 0 ? null : toNamespaceId(parts.slice(0, index).join("."));
    return {
      kind: "namespace",
      id,
      name: id,
      label: part,
      parentNamespaceId,
      style: null,
    };
  });
}
