/**
 * @fileoverview Builds applied-style edges from style-application tokens.
 */

import { toClassId, toStyleDefId } from "../../../../shared/ids";
import type { AppliesStyleEdge } from "../../../model/diagramTree";
import type { ParseToken } from "../tokenizer";
import { toSourceLocation } from "../toSourceLocation";

/**
 * Builds an applied-style edge from a style-application token.
 */
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
