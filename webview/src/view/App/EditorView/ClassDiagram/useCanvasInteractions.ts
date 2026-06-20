/**
 * @fileoverview Hook for translating canvas pane interactions into View state updates.
 */

import { useCallback } from "react";
import { useCanvasState } from "../../../contexts/CanvasStateContext";

type UseCanvasInteractionsResult = {
  onPaneClick: () => void;
};

/**
 * Clears class selection when the user clicks the canvas pane.
 */
export function useCanvasInteractions(): UseCanvasInteractionsResult {
  const { setCanvasState } = useCanvasState();

  const onPaneClick = useCallback(() => {
    setCanvasState({ selectedClassId: null });
  }, [setCanvasState]);

  return { onPaneClick };
}
