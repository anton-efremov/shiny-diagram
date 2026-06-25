/**
 * @fileoverview StylePane interaction pipeline.
 * Translates style-pane edits and keyboard events into editor commands.
 */

import { useCallback, useEffect } from "react";
import type { ClassId } from "../../../../shared/ids";
import { useDispatchCommand } from "../../contexts";
import {
  toClassDeleteCommand,
  toClassDuplicateCommand,
  toStyleSetClassPropertyCommand,
} from "./commands";
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

  // @job connect:command:wire
  const dispatchStyleChange = useCallback(
    (property: StyleCommand["property"], value: string) => {
      const command = toStyleSetClassPropertyCommand({
        selectedClassIds,
        property,
        value,
      });
      if (command) dispatchCommand(command);
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
    const command = toClassDeleteCommand(selectedClassIds);
    if (command) dispatchCommand(command);
  }, [selectedClassIds, dispatchCommand]);

  const onDuplicate = useCallback(() => {
    const command = toClassDuplicateCommand(selectedClassIds);
    if (command) dispatchCommand(command);
  }, [selectedClassIds, dispatchCommand]);

  // @job connect:event:wire
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      // @job connect:event:normalize
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
      // @job connect:command:wire
      const command = toClassDeleteCommand(selectedClassIds);
      if (command) dispatchCommand(command);
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
