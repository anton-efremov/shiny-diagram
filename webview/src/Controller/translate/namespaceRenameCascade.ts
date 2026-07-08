/**
 * @fileoverview Namespace subtree identity cascade derivation for rename-shaped namespace edits.
 */

import { toNamespaceId, type NamespaceId } from "../../shared/ids";
import type { DiagramGraph } from "../model/diagramGraph";

export type NamespaceRenamePair = {
  readonly from: NamespaceId;
  readonly to: NamespaceId;
};

export function toNamespaceRenamePairs(
  namespaceId: NamespaceId,
  nextId: NamespaceId,
  graph: DiagramGraph
): readonly NamespaceRenamePair[] {
  if (nextId === namespaceId) return [];

  return [...graph.namespaces.keys()].flatMap((candidateId) =>
    candidateId === namespaceId || candidateId.startsWith(`${namespaceId}.`)
      ? [
          {
            from: candidateId,
            to: toNamespaceId(`${nextId}${candidateId.slice(namespaceId.length)}`),
          },
        ]
      : []
  );
}
