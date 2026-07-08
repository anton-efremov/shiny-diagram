/**
 * @fileoverview Builds namespace membership edges from namespace tokens.
 */

import { toClassId, toNamespaceId } from "../../../../shared/ids";
import type { ClassId, NamespaceId } from "../../../../shared/ids";
import { IDENTITY_PATTERN, readIdentity } from "../../../model/identitySpelling";
import type { SourceSpan } from "../../../model/sourceEdit";
import type { ParseToken } from "../tokenizer";
import { toSourceSpan } from "../toSourceSpan";

export type InNamespaceEdge =
  | {
      readonly source: ClassId;
      readonly sourceKind: "class";
      readonly target: NamespaceId;
      readonly location: SourceSpan;
    }
  | {
      readonly source: NamespaceId;
      readonly sourceKind: "namespace";
      readonly target: NamespaceId;
      readonly location: SourceSpan;
    };

/**
 * Builds namespace membership edges for class declarations inside a namespace.
 */
export function buildInNamespaceEdges(
  token: ParseToken,
  parentNamespaceId: NamespaceId | null
): InNamespaceEdge[] {
  if (token.type !== "namespace") return [];

  const namespaceMatch = new RegExp(`^\\s*namespace\\s+(${IDENTITY_PATTERN})`).exec(token.raw);
  if (!namespaceMatch) return [];

  const identity = readIdentity(namespaceMatch[1]);
  const namespaceId = toNamespaceId(
    parentNamespaceId ? `${parentNamespaceId}.${identity}` : identity
  );
  const edges: InNamespaceEdge[] = [];

  for (const child of token.blockTokens ?? []) {
    if (child.type === "classDeclaration" || child.type === "styleApplication") {
      const classMatch = new RegExp(`^\\s*class\\s+(${IDENTITY_PATTERN})`).exec(child.raw);
      if (!classMatch) continue;
      edges.push({
        source: toClassId(readIdentity(classMatch[1])),
        sourceKind: "class",
        target: namespaceId,
        location: toSourceSpan(child),
      });
    }
    if (child.type === "namespace") {
      const childMatch = new RegExp(`^\\s*namespace\\s+(${IDENTITY_PATTERN})`).exec(child.raw);
      if (!childMatch) continue;
      edges.push({
        source: toNamespaceId(`${namespaceId}.${readIdentity(childMatch[1])}`),
        sourceKind: "namespace",
        target: namespaceId,
        location: toSourceSpan(child),
      });
    }
  }

  return edges;
}
