/**
 * @behavior Diagram style creation, default-copy, deletion, and rename outcome routing.
 */

import { useCallback } from "react";
import type { TransactionResult } from "../../../../commands/editorCommands";
import { useDispatchTransaction } from "../../../../contexts";
import type { SelectionState } from "../../../../state/editorStates";
import type { BaseStyleView, DeclaredStyleView } from "../../../../views/schema";
import type { StylePropertyName } from "../../../../../shared/style";
import {
  toBaseStylePropertySetTransaction,
  toDefaultStyleSetTransaction,
  toStyleCreateTransaction,
  toStyleDeleteTransaction,
  toStylePropertySetTransaction,
} from "./transactions";

type UseInteractionsInput = {
  readonly styles: readonly DeclaredStyleView[];
  readonly selectedStyle: DeclaredStyleView | undefined;
  readonly materializedBase: DeclaredStyleView | undefined;
  readonly baseStyle: BaseStyleView;
  readonly origin: Extract<SelectionState, { readonly kind: "classes" }> | undefined;
  readonly onSelectionRestore: (selectionState: SelectionState) => void;
  readonly onStyleCreateCommitted: (result: TransactionResult) => void;
};

type Interactions = {
  readonly onCreate: () => void;
  readonly onBack: () => void;
  readonly onSetAsDefault: () => void;
  readonly onResetBase: () => void;
  readonly onDelete: () => void;
  readonly onBasePropertyChange: (property: StylePropertyName, value: string | null) => void;
  readonly onNamedStylePropertyChange: (property: StylePropertyName, value: string | null) => void;
};

export function useInteractions({
  styles,
  selectedStyle,
  materializedBase,
  baseStyle,
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

  const onResetBase = useCallback(() => {
    const baseStyle = styles.find((styleView) => styleView.name === "default");
    if (baseStyle) dispatchTransaction(toStyleDeleteTransaction(baseStyle));
  }, [dispatchTransaction, styles]);

  const onDelete = useCallback(() => {
    if (!selectedStyle) return;
    dispatchTransaction(toStyleDeleteTransaction(selectedStyle));
  }, [dispatchTransaction, selectedStyle]);

  const onBasePropertyChange = useCallback(
    (property: StylePropertyName, value: string | null) => {
      dispatchTransaction(
        toBaseStylePropertySetTransaction(materializedBase, baseStyle, property, value)
      );
    },
    [baseStyle, dispatchTransaction, materializedBase]
  );

  const onNamedStylePropertyChange = useCallback(
    (property: StylePropertyName, value: string | null) => {
      if (!selectedStyle) return;
      dispatchTransaction(toStylePropertySetTransaction(selectedStyle, property, value));
    },
    [dispatchTransaction, selectedStyle]
  );

  return {
    onCreate,
    onBack,
    onSetAsDefault,
    onResetBase,
    onDelete,
    onBasePropertyChange,
    onNamedStylePropertyChange,
  };
}
