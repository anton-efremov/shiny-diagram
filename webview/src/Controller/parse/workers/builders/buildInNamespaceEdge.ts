/**
 * @fileoverview Builds namespace membership edges from namespace tokens.
 */

import { toClassId, toNamespaceId } from "../../../../shared/ids";
import type { ClassId, NamespaceId } from "../../../../shared/ids";
import type { SourceSpan } from "../../../model/sourceEdit";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "../toSourceLocation";

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

  const namespaceMatch = /^\s*namespace\s+(\w+)/.exec(token.raw);
  if (!namespaceMatch) return [];

  const namespaceId = toNamespaceId(namespaceMatch[1]);
  const edges: InNamespaceEdge[] = [];

  for (const child of token.blockTokens ?? []) {
    if (child.type !== "classDeclaration") continue;

    const classMatch = /^\s*class\s+(\w+)/.exec(child.raw);
    if (!classMatch) continue;

    edges.push({
      source: toClassId(classMatch[1]),
      target: namespaceId,
      location: toSourceLocation(child),
    });
  }

  return edges;
}
