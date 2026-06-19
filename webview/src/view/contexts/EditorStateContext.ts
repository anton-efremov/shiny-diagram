/**
 * @fileoverview React context providing parsed editor state to descendant view components.
 */
import { createContext, useContext } from "react";
import type { ElementViews } from "../../controller/deriveViews";

export type EditorHeaderState =
  | { readonly status: "ready" }
  | { readonly status: "invalidSyntax"; readonly message: string }
  | { readonly status: "missingAnnotations"; readonly missingIds: readonly string[] };

type EditorStateContextValue = {
  readonly sourceText: string;
  readonly parseStatus: EditorHeaderState;
  readonly elementViews: ElementViews | null;
};

export const EditorStateContext = createContext<EditorStateContextValue | null>(null);

/**
 * Consumes parsed editor state within a descendant of AppController.
 */
export function useEditorState(): EditorStateContextValue {
  const ctx = useContext(EditorStateContext);
  if (!ctx) throw new Error("useEditorState must be used within AppController");
  return ctx;
}
