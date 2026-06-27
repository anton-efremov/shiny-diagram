/**
 * @fileoverview Interaction handlers for ClassStylePane.
 *
 * Standard pattern:
 * - File name: `useInteractions.ts`.
 * - Exports `useXInteractions(...)`.
 * - Returns semantic UI handlers named `onX`.
 * - Handlers call `commands.ts` transaction helpers and dispatch the result.
 * - No command payload construction beyond calling transaction helpers.
 * - No JSX, no rendering decisions, no child prop derivation.
 */

import { useCallback } from "react";
import { useDispatchCommand } from "../../../contexts";
import {
  toBorderColorSetTransaction,
  toClassDeleteTransaction,
  toClassDuplicateTransaction,
  toFillColorSetTransaction,
  toTextColorSetTransaction,
} from "./commands";
import type { ClassView } from "../../../../views/schema";

type UseClassStylePaneInteractionsResult = {
  readonly onFillColorChange: (fill: string) => void;
  readonly onBorderColorChange: (border: string) => void;
  readonly onTextColorChange: (color: string) => void;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
};

export function useClassStylePaneInteractions(
  selectedClasses: readonly ClassView[]
): UseClassStylePaneInteractionsResult {
  const dispatchCommand = useDispatchCommand();

  const onFillColorChange = useCallback(
    (fill: string) => {
      const transaction = toFillColorSetTransaction(selectedClasses, fill);
      if (!transaction) return;
      dispatchCommand(transaction);
    },
    [selectedClasses, dispatchCommand]
  );

  const onBorderColorChange = useCallback(
    (border: string) => {
      const transaction = toBorderColorSetTransaction(selectedClasses, border);
      if (!transaction) return;
      dispatchCommand(transaction);
    },
    [selectedClasses, dispatchCommand]
  );

  const onTextColorChange = useCallback(
    (color: string) => {
      const transaction = toTextColorSetTransaction(selectedClasses, color);
      if (!transaction) return;
      dispatchCommand(transaction);
    },
    [selectedClasses, dispatchCommand]
  );

  const onDelete = useCallback(() => {
    const transaction = toClassDeleteTransaction(selectedClasses);
    if (!transaction) return;
    dispatchCommand(transaction);
  }, [selectedClasses, dispatchCommand]);

  const onDuplicate = useCallback(() => {
    const transaction = toClassDuplicateTransaction(selectedClasses);
    if (!transaction) return;
    dispatchCommand(transaction);
  }, [selectedClasses, dispatchCommand]);

  return {
    onFillColorChange,
    onBorderColorChange,
    onTextColorChange,
    onDuplicate,
    onDelete: onDelete,
  };
}
