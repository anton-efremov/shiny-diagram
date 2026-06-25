/**
 * @fileoverview ToolPane interaction pipeline.
 * Translates ToolPane clicks into class-placement state actions.
 */

import { useCallback } from "react";
import { useDispatchEditorStateAction } from "../contexts";

type UseToolPaneInteractionsResult = {
  onClassToolClick: () => void;
};

/**
 * Activates diagram placement tools from Tool Pane controls.
 */
export function useToolPaneInteractions(): UseToolPaneInteractionsResult {
  const dispatchEditorStateAction = useDispatchEditorStateAction();

  // @job connect:state:wire
  const onClassToolClick = useCallback(() => {
    dispatchEditorStateAction({ type: "placement.setMode", placementMode: "class" });
  }, [dispatchEditorStateAction]);

  return { onClassToolClick };
}
