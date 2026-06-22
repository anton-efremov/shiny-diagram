/**
 * @fileoverview Interaction handlers owned by the Shiny editor status surface.
 */

import { useCallback } from "react";
import { useEditorDispatch } from "../../contexts/EditorDispatchContext";

type UseEditorStatusInteractionsResult = {
  readonly onGenerate: () => void;
};

/**
 * Builds stable handlers for EditorStatus interaction surfaces.
 */
export function useEditorStatusInteractions(): UseEditorStatusInteractionsResult {
  const dispatch = useEditorDispatch();

  const onGenerate = useCallback(() => {
    dispatch({ type: "generate" });
  }, [dispatch]);

  return { onGenerate };
}
