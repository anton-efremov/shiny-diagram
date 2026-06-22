/**
 * @fileoverview Hook for translating style-pane edits into editor commands.
 */

import { useCallback, useEffect } from "react";
import type { EditorDispatch } from "../../commands/editorCommand";
import type { ClassBoxView } from "../ClassDiagram/ClassBox/views";
import type { ClassId } from "../../../shared/ids";

type UseStylePaneInteractionsOptions = {
  dispatch: EditorDispatch;
  selectedClassIds: readonly ClassId[];
  selectedView: ClassBoxView | undefined;
};

type UseStylePaneInteractionsResult = {
  onFillColorChange: (fill: string) => void;
  onDuplicate: () => void;
  onDeleteClick: () => void;
};

/**
 * Dispatches class style updates from style-pane controls.
 */
export function useStylePaneInteractions({
  dispatch,
  selectedClassIds,
  selectedView,
}: UseStylePaneInteractionsOptions): UseStylePaneInteractionsResult {
  const soleSelectedClassId = selectedClassIds.length === 1 ? selectedClassIds[0] : null;

  const onFillColorChange = useCallback(
    (fill: string) => {
      if (!soleSelectedClassId || !selectedView?.style) return;
      dispatch({
        type: "style.setClassProperty",
        classId: soleSelectedClassId,
        property: "fill",
        value: fill,
      });
    },
    [soleSelectedClassId, selectedView, dispatch]
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

  return { onFillColorChange, onDuplicate, onDeleteClick };
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
