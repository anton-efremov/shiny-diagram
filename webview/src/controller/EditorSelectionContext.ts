/**
 * @fileoverview React context providing selection state to descendant view components.
 * Avoids prop-drilling selection and onSelectionChange through intermediate view layers.
 */
import { createContext, useContext } from "react";
import type { Selection } from "./selection";

type EditorSelectionContextValue = {
  readonly selection: Selection;
  readonly onSelectionChange: (selection: Selection) => void;
};

export const EditorSelectionContext = createContext<EditorSelectionContextValue | null>(null);

/** Consume selection state within a descendant of AppController. */
export function useEditorSelection(): EditorSelectionContextValue {
  const ctx = useContext(EditorSelectionContext);
  if (!ctx) throw new Error("useEditorSelection must be used within AppController");
  return ctx;
}
