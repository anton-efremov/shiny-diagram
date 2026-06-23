/**
 * @fileoverview Interaction handlers owned by the Shiny editor status surface.
 */

import { useCallback } from "react";
import { useEditorCommandDispatch } from "../contexts";

type UseEditorStatusInteractionsResult = {
  readonly onGenerate: () => void;
};

/**
 * Builds stable handlers for EditorStatus interaction surfaces.
 */
export function useEditorStatusInteractions(): UseEditorStatusInteractionsResult {
  const dispatch = useEditorCommandDispatch();
  const onGenerate = useCallback(() => {
    dispatch({ type: "generate" });
  }, [dispatch]);

  return { onGenerate };
}
