/**
 * @logic ClassStylePane style edit and class action command dispatch decisions.
 */

import { useCallback } from "react";
import { useDispatchTransaction } from "../../../../contexts";
import {
  toBorderColorSetTransaction,
  toClassDeleteTransaction,
  toClassDuplicateTransaction,
  toFillColorSetTransaction,
  toTextColorSetTransaction,
} from "./transactions";
import type { ClassView } from "../../../../views/schema";

type Interactions = {
  readonly onFillColorChange: (fill: string) => void;
  readonly onBorderColorChange: (border: string) => void;
  readonly onTextColorChange: (color: string) => void;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
};

/** ── interaction hook area ──
 * Patterns: 4.6-3, 4.9-1
 */
export function useInteractions(selectedClasses: readonly ClassView[]): Interactions {
  const dispatchCommand = useDispatchTransaction();

  const onFillColorChange = useCallback(
    (fill: string) => {
      if (selectedClasses.length > 0) {
        dispatchCommand(toFillColorSetTransaction(selectedClasses, fill));
      }
    },
    [selectedClasses, dispatchCommand]
  );

  const onBorderColorChange = useCallback(
    (border: string) => {
      if (selectedClasses.length > 0) {
        dispatchCommand(toBorderColorSetTransaction(selectedClasses, border));
      }
    },
    [selectedClasses, dispatchCommand]
  );

  const onTextColorChange = useCallback(
    (color: string) => {
      if (selectedClasses.length > 0) {
        dispatchCommand(toTextColorSetTransaction(selectedClasses, color));
      }
    },
    [selectedClasses, dispatchCommand]
  );

  const onDelete = useCallback(() => {
    if (selectedClasses.length > 0) {
      dispatchCommand(toClassDeleteTransaction(selectedClasses));
    }
  }, [selectedClasses, dispatchCommand]);

  const onDuplicate = useCallback(() => {
    if (selectedClasses.length > 0) {
      dispatchCommand(toClassDuplicateTransaction(selectedClasses));
    }
  }, [selectedClasses, dispatchCommand]);

  return {
    onFillColorChange,
    onBorderColorChange,
    onTextColorChange,
    onDuplicate,
    onDelete,
  };
}
