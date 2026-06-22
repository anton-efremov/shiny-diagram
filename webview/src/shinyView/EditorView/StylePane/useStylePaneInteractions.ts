/**
 * @fileoverview Hook for translating style-pane edits into editor commands.
 */

import { useCallback, useEffect } from "react";
import type { EditorDispatch } from "../../commands/editorCommand";
import type { ClassId } from "../../../shared/ids";
import type { StyleCommand } from "./commands";

type UseStylePaneInteractionsOptions = {
  dispatch: EditorDispatch;
  selectedClassIds: readonly ClassId[];
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
  dispatch,
  selectedClassIds,
}: UseStylePaneInteractionsOptions): UseStylePaneInteractionsResult {
  const dispatchStyleChange = useCallback(
    (property: StyleCommand["property"], value: string) => {
      if (selectedClassIds.length === 0) return;
      dispatch({
        type: "style.setClassProperty",
        classIds: selectedClassIds,
        property,
        value,
      });
    },
    [selectedClassIds, dispatch]
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
    dispatch({ type: "class.delete", classIds: selectedClassIds });
  }, [selectedClassIds, dispatch]);

  const onDuplicate = useCallback(() => {
    if (selectedClassIds.length === 0) return;
    dispatch({ type: "class.duplicate", classIds: selectedClassIds });
  }, [selectedClassIds, dispatch]);

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
      dispatch({ type: "class.delete", classIds: selectedClassIds });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedClassIds, dispatch]);

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
