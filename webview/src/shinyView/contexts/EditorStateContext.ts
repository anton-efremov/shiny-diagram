/**
 * @fileoverview React context providing parsed editor state to descendant view components.
 */
import { createContext, useContext } from "react";
import type { EditorStatusView } from "../EditorView/EditorStatus/views";
import type { ElementViews } from "../EditorView/views";

type EditorStateContextValue = {
  readonly editorStatus: EditorStatusView;
  readonly elementViews: ElementViews | null;
};

export const EditorStateContext = createContext<EditorStateContextValue | null>(null);

/**
 * Consumes parsed editor state within a descendant of ShinyController.
 */
export function useEditorState(): EditorStateContextValue {
  const ctx = useContext(EditorStateContext);
  if (!ctx) throw new Error("useEditorState must be used within ShinyController");
  return ctx;
}
