import type { NamespaceNode } from "../../primitives";
import { toNamespaceId } from "../../primitives";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "./toSourceLocation";

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
