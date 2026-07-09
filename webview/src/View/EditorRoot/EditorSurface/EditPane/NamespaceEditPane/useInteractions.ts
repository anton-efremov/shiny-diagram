/**
 * @behavior Namespace edit-pane draft updates and command dispatch.
 */

import { useCallback } from "react";
import type { Dispatch, KeyboardEvent, MutableRefObject, SetStateAction } from "react";
import type { NamespaceId } from "../../../../../shared/ids";
import { useDispatchTransaction } from "../../../../contexts";
import type { TransactionResult } from "../../../../commands/editorCommands";
import type { NamespaceView } from "../../../../views/schema";
import {
  toNamespaceDeleteTransaction,
  toNamespaceNameCommitTransaction,
  toNamespaceStylePropertySetTransaction,
  toNamespaceStyleResetTransaction,
} from "./transactions";

type UseInteractionsInput = {
  readonly view: NamespaceView;
  readonly nameDraft: string;
  readonly setNameDraft: Dispatch<SetStateAction<string>>;
  readonly setErrors: Dispatch<SetStateAction<readonly string[]>>;
  readonly nameSettledRef: MutableRefObject<boolean>;
  readonly onNamespaceRenameCommitted: (
    result: TransactionResult,
    previousNamespaceId: NamespaceId
  ) => void;
};

type Interactions = {
  readonly onNameDraftChange: (value: string) => void;
  readonly onNameSubmit: () => void;
  readonly onNameKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly onValidationDismiss: () => void;
  readonly onFillChange: (value: string | null) => void;
  readonly onStrokeChange: (value: string | null) => void;
  readonly onTextColorChange: (value: string | null) => void;
  readonly onStrokeWidthChange: (value: string | null) => void;
  readonly onStrokeDasharrayChange: (value: string | null) => void;
  readonly onStyleReset: () => void;
  readonly onNamespaceDelete: () => void;
};

export function useInteractions({
  view,
  nameDraft,
  setNameDraft,
  setErrors,
  nameSettledRef,
  onNamespaceRenameCommitted,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onNameDraftChange = useCallback(
    (value: string) => {
      nameSettledRef.current = false;
      setNameDraft(value);
    },
    [nameSettledRef, setNameDraft]
  );

  const onNameSubmit = useCallback(() => {
    if (nameSettledRef.current) return;
    nameSettledRef.current = true;
    const result = dispatchTransaction(
      toNamespaceNameCommitTransaction(view.namespaceId, nameDraft.trim())
    );
    if (result.status === "committed") {
      setErrors([]);
      onNamespaceRenameCommitted(result, view.namespaceId);
      return;
    }
    const messages = result.errors.map((error) => error.message);
    setErrors(messages);
    if (messages.length > 0) nameSettledRef.current = false;
  }, [
    dispatchTransaction,
    nameDraft,
    nameSettledRef,
    onNamespaceRenameCommitted,
    setErrors,
    view.namespaceId,
  ]);

  const onNameKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      onNameSubmit();
    },
    [onNameSubmit]
  );

  const onValidationDismiss = useCallback(() => {
    setErrors([]);
  }, [setErrors]);

  const onFillChange = useCallback(
    (value: string | null) => {
      dispatchTransaction(toNamespaceStylePropertySetTransaction(view, "fill", value));
    },
    [dispatchTransaction, view]
  );

  const onStrokeChange = useCallback(
    (value: string | null) => {
      dispatchTransaction(toNamespaceStylePropertySetTransaction(view, "stroke", value));
    },
    [dispatchTransaction, view]
  );

  const onTextColorChange = useCallback(
    (value: string | null) => {
      dispatchTransaction(toNamespaceStylePropertySetTransaction(view, "color", value));
    },
    [dispatchTransaction, view]
  );

  const onStrokeWidthChange = useCallback(
    (value: string | null) => {
      dispatchTransaction(toNamespaceStylePropertySetTransaction(view, "strokeWidth", value));
    },
    [dispatchTransaction, view]
  );

  const onStrokeDasharrayChange = useCallback(
    (value: string | null) => {
      dispatchTransaction(toNamespaceStylePropertySetTransaction(view, "strokeDasharray", value));
    },
    [dispatchTransaction, view]
  );

  const onStyleReset = useCallback(() => {
    dispatchTransaction(toNamespaceStyleResetTransaction(view.namespaceId));
  }, [dispatchTransaction, view.namespaceId]);

  const onNamespaceDelete = useCallback(() => {
    dispatchTransaction(toNamespaceDeleteTransaction(view.namespaceId));
  }, [dispatchTransaction, view.namespaceId]);

  return {
    onNameDraftChange,
    onNameSubmit,
    onNameKeyDown,
    onValidationDismiss,
    onFillChange,
    onStrokeChange,
    onTextColorChange,
    onStrokeWidthChange,
    onStrokeDasharrayChange,
    onStyleReset,
    onNamespaceDelete,
  };
}
