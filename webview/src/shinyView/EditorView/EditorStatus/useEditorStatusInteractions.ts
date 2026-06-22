/**
 * @fileoverview Interaction handlers owned by the Shiny editor status surface.
 */

import { useCallback } from "react";
import type { EditorDispatch } from "../../commands/editorCommand";

type UseEditorStatusInteractionsResult = {
  readonly onGenerate: () => void;
};

/**
 * Builds stable handlers for EditorStatus interaction surfaces.
 */
export function useEditorStatusInteractions(
  dispatch: EditorDispatch
): UseEditorStatusInteractionsResult {
  const onGenerate = useCallback(() => {
    dispatch({ type: "generate" });
  }, [dispatch]);

  return { onGenerate };
}
