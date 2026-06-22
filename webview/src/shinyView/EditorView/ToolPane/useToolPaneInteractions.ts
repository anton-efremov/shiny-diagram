/**
 * @fileoverview Hook for translating Tool Pane interactions into canvas state updates.
 */

import { useCallback } from "react";
import type { PlacementMode } from "../placementMode";

type UseToolPaneInteractionsResult = {
  onClassToolClick: () => void;
};

/**
 * Activates diagram placement tools from Tool Pane controls.
 */
export function useToolPaneInteractions(
  onPlacementModeChange: (placementMode: PlacementMode | null) => void
): UseToolPaneInteractionsResult {
  const onClassToolClick = useCallback(() => {
    onPlacementModeChange("class");
  }, [onPlacementModeChange]);

  return { onClassToolClick };
}
