/**
 * @behavior Diagram style creation, default-copy, deletion, and rename outcome routing.
 */

import { useCallback } from "react";
import type { TransactionResult } from "../../../../commands/editorCommands";
import { useDispatchTransaction } from "../../../../contexts";
import type { SelectionState } from "../../../../state/editorStates";
import type { DeclaredStyleView } from "../../../../views/schema";
import {
  toDefaultStyleSetTransaction,
  toStyleCreateTransaction,
  toStyleDeleteTransaction,
} from "./transactions";

type UseInteractionsInput = {
  readonly styles: readonly DeclaredStyleView[];
  readonly selectedStyle: DeclaredStyleView | undefined;
  readonly origin: Extract<SelectionState, { readonly kind: "classes" }> | undefined;
  readonly onSelectionRestore: (selectionState: SelectionState) => void;
  readonly onStyleCreateCommitted: (result: TransactionResult) => void;
};

type Interactions = {
  readonly onCreate: () => void;
  readonly onBack: () => void;
  readonly onSetAsDefault: () => void;
  readonly onDelete: () => void;
};

export function useInteractions({
  styles,
  selectedStyle,
  origin,
  onSelectionRestore,
  onStyleCreateCommitted,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onCreate = useCallback(() => {
    const result = dispatchTransaction(toStyleCreateTransaction(styles));
    onStyleCreateCommitted(result);
  }, [dispatchTransaction, onStyleCreateCommitted, styles]);

  const onBack = useCallback(() => {
    if (origin) onSelectionRestore(origin);
  }, [onSelectionRestore, origin]);

  const onSetAsDefault = useCallback(() => {
    if (!selectedStyle) return;
    const defaultStyle = styles.find((styleView) => styleView.name === "default");
    dispatchTransaction(toDefaultStyleSetTransaction(selectedStyle, defaultStyle));
  }, [dispatchTransaction, selectedStyle, styles]);

  const onDelete = useCallback(() => {
    if (!selectedStyle) return;
    dispatchTransaction(toStyleDeleteTransaction(selectedStyle));
  }, [dispatchTransaction, selectedStyle]);

  return { onCreate, onBack, onSetAsDefault, onDelete };
}
