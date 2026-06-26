/**
 * @fileoverview ToolPane interaction pipeline.
 * Translates ToolPane clicks into class-placement state actions.
 */

import { useCallback } from "react";
import { useDispatchCanvasViewStateAction } from "../contexts";

type UseToolPaneInteractionsResult = {
  onClassToolClick: () => void;
};

/**
 * Activates diagram placement tools from Tool Pane controls.
 */
export function useToolPaneInteractions(): UseToolPaneInteractionsResult {
  const dispatchCanvasViewStateAction = useDispatchCanvasViewStateAction();

  // @job connect:state:wire
  const onClassToolClick = useCallback(() => {
    dispatchCanvasViewStateAction({ type: "placement.setMode", nodePlacementState: "class" });
  }, [dispatchCanvasViewStateAction]);

  return { onClassToolClick };
}
