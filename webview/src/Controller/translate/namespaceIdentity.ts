/**
 * @fileoverview Generates source identities for namespace write intents.
 */

import { toNamespaceId, type NamespaceId } from "../../shared/ids";
import type { DiagramGraph } from "../model/diagramGraph";

const BASE_NAMESPACE_ID = "NewNamespace";

export function allocateNamespaceId(
  graph: DiagramGraph,
  reservedNamespaceIds: ReadonlySet<NamespaceId> = new Set()
): NamespaceId {
  if (!isNamespaceIdUnavailable(graph, reservedNamespaceIds, toNamespaceId(BASE_NAMESPACE_ID))) {
    return toNamespaceId(BASE_NAMESPACE_ID);
  }

  let suffix = 2;
  while (
    isNamespaceIdUnavailable(
      graph,
      reservedNamespaceIds,
      toNamespaceId(`${BASE_NAMESPACE_ID}${suffix}`)
    )
  ) {
    suffix++;
  }

  return toNamespaceId(`${BASE_NAMESPACE_ID}${suffix}`);
}

function isNamespaceIdUnavailable(
  graph: DiagramGraph,
  reservedNamespaceIds: ReadonlySet<NamespaceId>,
  namespaceId: NamespaceId
): boolean {
  return graph.namespaces.has(namespaceId) || reservedNamespaceIds.has(namespaceId);
}
