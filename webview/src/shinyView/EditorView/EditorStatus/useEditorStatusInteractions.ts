/**
 * @fileoverview Interaction handlers owned by the Shiny editor status surface.
 */

import { useCallback } from "react";
import { useDispatchCommand } from "../contexts";

type UseEditorStatusInteractionsResult = {
  readonly onGenerate: () => void;
};

/**
 * Builds stable handlers for EditorStatus interaction surfaces.
 */
export function useEditorStatusInteractions(): UseEditorStatusInteractionsResult {
  const dispatchCommand = useDispatchCommand();
  const onGenerate = useCallback(() => {
    dispatchCommand({ type: "generate" });
  }, [dispatchCommand]);

  return { onGenerate };
}
