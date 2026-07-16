/**
 * @behavior Namespace rename, style, reset, and delete transaction derivation.
 */

import type { NamespaceId } from "../../../../../shared/ids";
import type { StyleProperties, StylePropertyName } from "../../../../../shared/style";
import type { EditorCommandTransaction } from "../../../../commands/editorCommands";
import type { NamespaceView } from "../../../../views/schema";

const EMPTY_STYLE_PROPERTIES: StyleProperties = {
  fill: null,
  stroke: null,
  strokeWidth: null,
  strokeDasharray: null,
  color: null,
};

export function toNamespaceNameCommitTransaction(
  namespaceId: NamespaceId,
  name: string
): EditorCommandTransaction {
  return [{ type: "namespace.name.set", namespaceId, name }];
}

export function toNamespaceStylePropertySetTransaction(
  view: NamespaceView,
  property: StylePropertyName,
  value: string | null
): EditorCommandTransaction {
  return [
    {
      type: "namespace.style.set",
      namespaceId: view.namespaceId,
      style: { ...(view.style ?? EMPTY_STYLE_PROPERTIES), [property]: value },
    },
  ];
}

export function toNamespaceStyleResetTransaction(
  namespaceId: NamespaceId
): EditorCommandTransaction {
  return [{ type: "namespace.style.set", namespaceId, style: null }];
}

export function toNamespaceDeleteTransaction(namespaceId: NamespaceId): EditorCommandTransaction {
  return [{ type: "namespace.delete", namespaceId }];
}
