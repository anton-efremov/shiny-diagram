/**
 * @fileoverview Class style pane interaction pipeline.
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
import type { ClassStylePaneView } from "./views";

type UseClassStylePaneInteractionsResult = {
  readonly onFillColorChange: (fill: string) => void;
  readonly onBorderColorChange: (border: string) => void;
  readonly onTextColorChange: (color: string) => void;
  readonly onDuplicate: () => void;
  readonly onDeleteClick: () => void;
};

export function useClassStylePaneInteractions(
  view: ClassStylePaneView
): UseClassStylePaneInteractionsResult {
  const dispatchCommand = useDispatchCommand();
  const { selectedClasses } = view;

  const onFillColorChange = useCallback(
    (fill: string) => {
      // @job logic:command:derive
      const transaction = toFillColorSetTransaction(selectedClasses, fill);
      if (!transaction) return;

      // @job connect:command:wire
      dispatchCommand(transaction);
    },
    [selectedClasses, dispatchCommand]
  );

  const onBorderColorChange = useCallback(
    (border: string) => {
      // @job logic:command:derive
      const transaction = toBorderColorSetTransaction(selectedClasses, border);
      if (!transaction) return;

      // @job connect:command:wire
      dispatchCommand(transaction);
    },
    [selectedClasses, dispatchCommand]
  );

  const onTextColorChange = useCallback(
    (color: string) => {
      // @job logic:command:derive
      const transaction = toTextColorSetTransaction(selectedClasses, color);
      if (!transaction) return;

      // @job connect:command:wire
      dispatchCommand(transaction);
    },
    [selectedClasses, dispatchCommand]
  );

  const onDeleteClick = useCallback(() => {
    // @job logic:command:derive
    const transaction = toClassDeleteTransaction(selectedClasses);
    if (!transaction) return;

    // @job connect:command:wire
    dispatchCommand(transaction);
  }, [selectedClasses, dispatchCommand]);

  const onDuplicate = useCallback(() => {
    // @job logic:command:derive
    const transaction = toClassDuplicateTransaction(selectedClasses);
    if (!transaction) return;

    // @job connect:command:wire
    dispatchCommand(transaction);
  }, [selectedClasses, dispatchCommand]);

  return { onFillColorChange, onBorderColorChange, onTextColorChange, onDuplicate, onDeleteClick };
}
