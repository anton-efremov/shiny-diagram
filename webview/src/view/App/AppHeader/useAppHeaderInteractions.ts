/**
 * @fileoverview Interaction handlers owned by the application header.
 */

import { useCallback } from "react";
import { useEditorDispatch } from "../../contexts/EditorDispatchContext";

type UseAppHeaderInteractionsResult = {
  readonly onGenerate: () => void;
};

/**
 * Builds stable handlers for AppHeader interaction surfaces.
 */
export function useAppHeaderInteractions(): UseAppHeaderInteractionsResult {
  const dispatch = useEditorDispatch();

  const onGenerate = useCallback(() => {
    dispatch({ type: "generate" });
  }, [dispatch]);

  return { onGenerate };
}
