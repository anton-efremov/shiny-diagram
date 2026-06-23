/**
 * @fileoverview Hook for translating style-pane edits into editor commands.
 */

import { useCallback, useEffect } from "react";
import type { ClassId } from "../../../../shared/ids";
import { useDispatchCommand } from "../../contexts";
import type { StyleCommand } from "./commands";

type UseStylePaneInteractionsOptions = {
  readonly selectedClassIds: readonly ClassId[];
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
}: UseStylePaneInteractionsOptions): UseStylePaneInteractionsResult {
  const dispatchCommand = useDispatchCommand();
  const dispatchStyleChange = useCallback(
    (property: StyleCommand["property"], value: string) => {
      if (selectedClassIds.length === 0) return;
      dispatchCommand({
        type: "style.setClassProperty",
        classIds: selectedClassIds,
        property,
        value,
      });
    },
    [selectedClassIds, dispatchCommand]
  );

  const onFillColorChange = useCallback(
    (fill: string) => dispatchStyleChange("fill", fill),
    [dispatchStyleChange]
  );

  const onStrokeColorChange = useCallback(
    (stroke: string) => dispatchStyleChange("stroke", stroke),
    [dispatchStyleChange]
  );

  const onTextColorChange = useCallback(
    (color: string) => dispatchStyleChange("color", color),
    [dispatchStyleChange]
  );

  const onDeleteClick = useCallback(() => {
    if (selectedClassIds.length === 0) return;
    dispatchCommand({ type: "class.delete", classIds: selectedClassIds });
  }, [selectedClassIds, dispatchCommand]);

  const onDuplicate = useCallback(() => {
    if (selectedClassIds.length === 0) return;
    dispatchCommand({ type: "class.duplicate", classIds: selectedClassIds });
  }, [selectedClassIds, dispatchCommand]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (
        selectedClassIds.length === 0 ||
        event.defaultPrevented ||
        event.repeat ||
        event.key !== "Delete" ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();
      dispatchCommand({ type: "class.delete", classIds: selectedClassIds });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedClassIds, dispatchCommand]);

  return { onFillColorChange, onStrokeColorChange, onTextColorChange, onDuplicate, onDeleteClick };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") return true;

  return (
    (target instanceof HTMLElement && target.isContentEditable) ||
    target.closest("[contenteditable]:not([contenteditable='false'])") !== null
  );
}
