/**
 * @behavior Class style edit and class action command dispatch handlers.
 */

import { useCallback } from "react";
import { useDispatchTransaction } from "../../../../contexts";
import {
  toBorderColorSetTransaction,
  toClassDeleteTransaction,
  toClassDuplicateTransaction,
  toFillColorSetTransaction,
} from "./transactions";
import type { ClassView } from "../../../../views/schema";

type Interactions = {
  readonly onFillColorChange: (fill: string) => void;
  readonly onBorderColorChange: (border: string) => void;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
};

export function useInteractions(selectedClasses: readonly ClassView[]): Interactions {
  const dispatchCommand = useDispatchTransaction();

  const selectedClassIds = selectedClasses.map((selectedClass) => selectedClass.classId);

  // Event handler props derivation
  // Implementing interaction through command transaction
  const onFillColorChange = useCallback(
    (fill: string) => {
      if (selectedClassIds.length > 0) {
        dispatchCommand(toFillColorSetTransaction(selectedClassIds, fill));
      }
    },
    [selectedClassIds, dispatchCommand]
  );

  const onBorderColorChange = useCallback(
    (border: string) => {
      if (selectedClassIds.length > 0) {
        dispatchCommand(toBorderColorSetTransaction(selectedClassIds, border));
      }
    },
    [selectedClassIds, dispatchCommand]
  );

  const onDelete = useCallback(() => {
    if (selectedClassIds.length > 0) {
      dispatchCommand(toClassDeleteTransaction(selectedClassIds));
    }
  }, [selectedClassIds, dispatchCommand]);

  const onDuplicate = useCallback(() => {
    if (selectedClasses.length > 0) {
      dispatchCommand(toClassDuplicateTransaction(selectedClasses));
    }
  }, [selectedClasses, dispatchCommand]);

  return {
    onFillColorChange,
    onBorderColorChange,
    onDuplicate,
    onDelete,
  };
}
