import type { AppliesStyleEdge } from "../../model/diagramTreeModel";
import { toClassId, toStyleDefId } from "../../model/primitives";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "./toSourceLocation";

export function buildAppliesStyleEdge(token: ParseToken): AppliesStyleEdge | null {
  if (token.type !== "styleApplication") return null;

  const match = /^\s*class\s+(\w+):::(\w+)/.exec(token.raw);
  if (!match) return null;

  return {
    kind: "appliesStyle",
    source: toClassId(match[1]),
    target: toStyleDefId(match[2]),
    location: toSourceLocation(token),
  };
}
