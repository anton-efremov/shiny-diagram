/**
 * @fileoverview Hook for translating Tool Pane interactions into class-placement-mode updates.
 */

import { useCallback } from "react";
import { useDispatchEditorStateAction } from "../../contexts";

type UseToolPaneInteractionsResult = {
  onClassToolClick: () => void;
};

/**
 * Activates diagram placement tools from Tool Pane controls.
 */
export function useToolPaneInteractions(): UseToolPaneInteractionsResult {
  const dispatchEditorStateAction = useDispatchEditorStateAction();
  const onClassToolClick = useCallback(() => {
    dispatchEditorStateAction({ type: "placement.setMode", placementMode: "class" });
  }, [dispatchEditorStateAction]);

  return { onClassToolClick };
}
