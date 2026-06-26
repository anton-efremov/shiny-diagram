/**
 * @fileoverview Single-class style pane interaction pipeline.
 */

import { useCallback, useMemo } from "react";
import { useDispatchCommand } from "../../../contexts";
import { toClassDeleteTransaction } from "../../commands";
import {
  toBorderColorSetTransaction,
  toClassDuplicateTransaction,
  toFillColorSetTransaction,
  toTextColorSetTransaction,
} from "../commands";
import type { SingleClassStylePaneView } from "./views";

type UseSingleClassStylePaneInteractionsResult = {
  readonly onFillColorChange: (fill: string) => void;
  readonly onStrokeColorChange: (stroke: string) => void;
  readonly onTextColorChange: (color: string) => void;
  readonly onDuplicate: () => void;
  readonly onDeleteClick: () => void;
};

export function useSingleClassStylePaneInteractions(
  view: SingleClassStylePaneView
): UseSingleClassStylePaneInteractionsResult {
  const dispatchCommand = useDispatchCommand();
  const { classView } = view;
  const selectedClassIds = useMemo(() => [classView.classId], [classView.classId]);

  const onFillColorChange = useCallback(
    (fill: string) => {
      // @job logic:command:derive
      const transaction = toFillColorSetTransaction(selectedClassIds, fill);
      if (!transaction) return;

      // @job connect:command:wire
      dispatchCommand(transaction);
    },
    [selectedClassIds, dispatchCommand]
  );

  const onStrokeColorChange = useCallback(
    (stroke: string) => {
      // @job logic:command:derive
      const transaction = toBorderColorSetTransaction(selectedClassIds, stroke);
      if (!transaction) return;

      // @job connect:command:wire
      dispatchCommand(transaction);
    },
    [selectedClassIds, dispatchCommand]
  );

  const onTextColorChange = useCallback(
    (color: string) => {
      // @job logic:command:derive
      const transaction = toTextColorSetTransaction(selectedClassIds, color);
      if (!transaction) return;

      // @job connect:command:wire
      dispatchCommand(transaction);
    },
    [selectedClassIds, dispatchCommand]
  );

  const onDeleteClick = useCallback(() => {
    // @job logic:command:derive
    const transaction = toClassDeleteTransaction(selectedClassIds);
    if (!transaction) return;

    // @job connect:command:wire
    dispatchCommand(transaction);
  }, [selectedClassIds, dispatchCommand]);

  const onDuplicate = useCallback(() => {
    // @job logic:command:derive
    const transaction = toClassDuplicateTransaction([classView]);
    if (!transaction) return;

    // @job connect:command:wire
    dispatchCommand(transaction);
  }, [classView, dispatchCommand]);

  return { onFillColorChange, onStrokeColorChange, onTextColorChange, onDuplicate, onDeleteClick };
}
