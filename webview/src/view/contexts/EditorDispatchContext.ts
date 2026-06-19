/**
 * @fileoverview React context providing dispatch to descendant view components.
 * Avoids prop-drilling dispatch through intermediate view layers.
 */
import { createContext, useContext } from "react";
import type { EditorCommand } from "../../controller/commands";

export const EditorDispatchContext = createContext<((command: EditorCommand) => void) | null>(null);

/** Consume dispatch within a descendant of AppController. */
export function useEditorDispatch(): (command: EditorCommand) => void {
  const dispatch = useContext(EditorDispatchContext);
  if (!dispatch) throw new Error("useEditorDispatch must be used within AppController");
  return dispatch;
}
