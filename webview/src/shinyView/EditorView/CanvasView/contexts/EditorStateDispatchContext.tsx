/**
 * @fileoverview Transport-only Editor state action dispatch context.
 */

import { createContext, useContext } from "react";
import type { Dispatch } from "react";
import type { EditorStateAction } from "../state";

export const EditorStateDispatchContext = createContext<Dispatch<EditorStateAction> | null>(null);

export function useDispatchEditorStateAction(): Dispatch<EditorStateAction> {
  const dispatchEditorStateAction = useContext(EditorStateDispatchContext);
  if (!dispatchEditorStateAction) {
    throw new Error("useDispatchEditorStateAction must be used within CanvasView");
  }
  return dispatchEditorStateAction;
}
