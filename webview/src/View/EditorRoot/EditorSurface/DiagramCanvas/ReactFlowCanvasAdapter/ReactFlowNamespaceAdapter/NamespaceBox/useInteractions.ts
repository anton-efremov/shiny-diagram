/**
 * @behavior Namespace selection, inline-name editing, and rename transaction dispatch.
 */

import { useCallback } from "react";
import type { MouseEvent } from "react";
import type { NamespaceId } from "../../../../../../../shared/ids";
import type { TransactionResult } from "../../../../../../commands/editorCommands";
import { useDispatchTransaction } from "../../../../../../contexts";
import type { EditingState } from "../../../../../../state/editorStates";
import { toNamespaceNameCommitTransaction } from "./transactions";

type Interactions = {
  readonly onNamespaceClick: (event: MouseEvent<HTMLDivElement>) => void;
  readonly onNamespacePress: () => void;
  readonly onLabelClick: (event: MouseEvent<HTMLDivElement>) => void;
  readonly onLabelDoubleClick: (event: MouseEvent<HTMLDivElement>) => void;
  readonly onNameCommit: (name: string) => readonly string[];
};

type UseInteractionsInput = {
  readonly namespaceId: NamespaceId;
  readonly isSelected: boolean;
  readonly onNamespaceSelect: (namespaceId: NamespaceId) => void;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
  readonly onNamespaceRenameCommitted: (
    result: TransactionResult,
    previousNamespaceId: NamespaceId
  ) => void;
};

export function useInteractions({
  namespaceId,
  isSelected,
  onNamespaceSelect,
  onTextBlockEditStart,
  onTextBlockEditCancel,
  onNamespaceRenameCommitted,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onNamespaceClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      onNamespaceSelect(namespaceId);
    },
    [namespaceId, onNamespaceSelect]
  );
  const onNamespacePress = useCallback(
    () => onNamespaceSelect(namespaceId),
    [namespaceId, onNamespaceSelect]
  );
  const onLabelClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (isSelected) onTextBlockEditStart({ kind: "namespaceName", namespaceId });
      else onNamespaceSelect(namespaceId);
    },
    [isSelected, namespaceId, onNamespaceSelect, onTextBlockEditStart]
  );
  const onLabelDoubleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      onTextBlockEditStart({ kind: "namespaceName", namespaceId });
    },
    [namespaceId, onTextBlockEditStart]
  );
  const onNameCommit = useCallback(
    (name: string) => {
      const result = dispatchTransaction(
        toNamespaceNameCommitTransaction(namespaceId, name.trim())
      );
      if (result.status === "rejected") return result.errors.map((error) => error.message);
      onTextBlockEditCancel();
      onNamespaceRenameCommitted(result, namespaceId);
      return [];
    },
    [dispatchTransaction, namespaceId, onNamespaceRenameCommitted, onTextBlockEditCancel]
  );
  return { onNamespaceClick, onNamespacePress, onLabelClick, onLabelDoubleClick, onNameCommit };
}
