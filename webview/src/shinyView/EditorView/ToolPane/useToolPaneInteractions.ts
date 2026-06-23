/**
 * @fileoverview Hook for translating Tool Pane interactions into class-placement-mode updates.
 */

import { useCallback } from "react";
import { useEditorViewDispatch } from "../contexts";

type UseToolPaneInteractionsResult = {
  onClassToolClick: () => void;
};

/**
 * Activates diagram placement tools from Tool Pane controls.
 */
export function useToolPaneInteractions(): UseToolPaneInteractionsResult {
  const dispatch = useEditorViewDispatch();
  const onClassToolClick = useCallback(() => {
    dispatch({ type: "placement.setMode", placementMode: "class" });
  }, [dispatch]);

  return { onClassToolClick };
}
