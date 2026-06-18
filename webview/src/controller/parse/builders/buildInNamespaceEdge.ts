import type { InNamespaceEdge } from "../../model/diagramTreeModel";
import { toClassId, toNamespaceId } from "../../model/primitives";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "./toSourceLocation";

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
      kind: "inNamespace",
      source: toClassId(classMatch[1]),
      target: namespaceId,
      location: toSourceLocation(child),
    });
  }

  return edges;
}
