/**
 * @role [P] Presentational
 * @presents Transport-only Editor state action dispatch context.
 */

import { createContext, useContext } from "react";
import type { Dispatch, ReactNode } from "react";
import type { EditorStateAction } from "../editorState";

const EditorStateDispatchContext = createContext<Dispatch<EditorStateAction> | null>(null);

type EditorStateDispatchProviderProps = {
  readonly dispatchEditorStateAction: Dispatch<EditorStateAction>;
  readonly children: ReactNode;
};

export function EditorStateDispatchProvider({
  dispatchEditorStateAction,
  children,
}: EditorStateDispatchProviderProps): ReactNode {
  // @job render:ui
  return (
    <EditorStateDispatchContext.Provider value={dispatchEditorStateAction}>
      {children}
    </EditorStateDispatchContext.Provider>
  );
}

export function useDispatchEditorStateAction(): Dispatch<EditorStateAction> {
  const dispatchEditorStateAction = useContext(EditorStateDispatchContext);
  if (!dispatchEditorStateAction) {
    throw new Error("useDispatchEditorStateAction must be used within EditorStateDispatchProvider");
  }
  return dispatchEditorStateAction;
}
