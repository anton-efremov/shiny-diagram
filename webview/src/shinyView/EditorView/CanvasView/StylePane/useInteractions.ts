/**
 * @fileoverview StylePane interaction pipeline.
 * Translates style-pane edits into editor commands.
 */

import { useCallback } from "react";
import type { ClassId } from "../../../../shared/ids";
import { useDispatchCommand } from "../../contexts";
import { toClassDeleteTransaction } from "../commands";
import {
  toBorderColorSetTransaction,
  toClassDuplicateTransaction,
  toFillColorSetTransaction,
  toTextColorSetTransaction,
} from "./commands";
import type { ClassBoxView } from "../ClassDiagram/views";

type UseStylePaneInteractionsOptions = {
  readonly selectedClassIds: readonly ClassId[];
  readonly selectedClassViews: readonly ClassBoxView[];
};

type UseStylePaneInteractionsResult = {
  onFillColorChange: (fill: string) => void;
  onStrokeColorChange: (stroke: string) => void;
  onTextColorChange: (color: string) => void;
  onDuplicate: () => void;
  onDeleteClick: () => void;
};

/**
 * Dispatches class style updates from style-pane controls.
 */
export function useStylePaneInteractions({
  selectedClassIds,
  selectedClassViews,
}: UseStylePaneInteractionsOptions): UseStylePaneInteractionsResult {
  const dispatchCommand = useDispatchCommand();

  const onFillColorChange = useCallback(
    (fill: string) => {
      const transaction = toFillColorSetTransaction(selectedClassIds, fill);
      if (transaction) dispatchCommand(transaction);
    },
    [selectedClassIds, dispatchCommand]
  );

  const onStrokeColorChange = useCallback(
    (stroke: string) => {
      const transaction = toBorderColorSetTransaction(selectedClassIds, stroke);
      if (transaction) dispatchCommand(transaction);
    },
    [selectedClassIds, dispatchCommand]
  );

  const onTextColorChange = useCallback(
    (color: string) => {
      const transaction = toTextColorSetTransaction(selectedClassIds, color);
      if (transaction) dispatchCommand(transaction);
    },
    [selectedClassIds, dispatchCommand]
  );

  const onDeleteClick = useCallback(() => {
    const transaction = toClassDeleteTransaction(selectedClassIds);
    if (transaction) dispatchCommand(transaction);
  }, [selectedClassIds, dispatchCommand]);

  const onDuplicate = useCallback(() => {
    const transaction = toClassDuplicateTransaction(selectedClassViews);
    if (transaction) dispatchCommand(transaction);
  }, [selectedClassViews, dispatchCommand]);

  return { onFillColorChange, onStrokeColorChange, onTextColorChange, onDuplicate, onDeleteClick };
}
