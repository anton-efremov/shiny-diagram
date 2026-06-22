/**
 * @fileoverview Hook for translating Tool Pane interactions into canvas state updates.
 */

import { useCallback } from "react";
import { useCanvasState } from "../../contexts/CanvasStateContext";

type UseToolPaneInteractionsResult = {
  onClassToolClick: () => void;
};

/**
 * Activates diagram placement tools from Tool Pane controls.
 */
export function useToolPaneInteractions(): UseToolPaneInteractionsResult {
  const { setCanvasState } = useCanvasState();

  const onClassToolClick = useCallback(() => {
    setCanvasState({ placementMode: "class" });
  }, [setCanvasState]);

  return { onClassToolClick };
}
