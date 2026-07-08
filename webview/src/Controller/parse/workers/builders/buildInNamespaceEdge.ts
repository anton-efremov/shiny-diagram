/**
 * @fileoverview Builds namespace membership edges from namespace tokens.
 */

import { toClassId, toNamespaceId } from "../../../../shared/ids";
import type { ClassId, NamespaceId } from "../../../../shared/ids";
import { IDENTITY_PATTERN, readIdentity } from "../../../model/identitySpelling";
import type { SourceSpan } from "../../../model/sourceEdit";
import type { ParseToken } from "../tokenizer";
import { toSourceSpan } from "../toSourceSpan";

export type InNamespaceEdge = {
  readonly source: ClassId;
  readonly target: NamespaceId;
  readonly location: SourceSpan;
};

/**
 * Builds namespace membership edges for class declarations inside a namespace.
 */
export function buildInNamespaceEdges(token: ParseToken): InNamespaceEdge[] {
  if (token.type !== "namespace") return [];

  const namespaceMatch = new RegExp(`^\\s*namespace\\s+(${IDENTITY_PATTERN})`).exec(token.raw);
  if (!namespaceMatch) return [];

  const namespaceId = toNamespaceId(readIdentity(namespaceMatch[1]));
  const edges: InNamespaceEdge[] = [];

  for (const child of token.blockTokens ?? []) {
    if (child.type !== "classDeclaration") continue;

    const classMatch = new RegExp(`^\\s*class\\s+(${IDENTITY_PATTERN})`).exec(child.raw);
    if (!classMatch) continue;

    edges.push({
      source: toClassId(readIdentity(classMatch[1])),
      target: namespaceId,
      location: toSourceSpan(child),
    });
  }

  return edges;
}
