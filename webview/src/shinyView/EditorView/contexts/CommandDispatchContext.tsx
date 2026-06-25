/**
 * @fileoverview EditorView command dispatch context.
 * Provides the View-to-Controller command transport and its fail-fast consumer hook.
 */

import { createContext, useContext } from "react";
import type { EditorDispatch } from "../../commands/editorCommand";

export const CommandDispatchContext = createContext<EditorDispatch | null>(null);

export function useDispatchCommand(): EditorDispatch {
  const dispatchCommand = useContext(CommandDispatchContext);
  if (!dispatchCommand) {
    throw new Error("useDispatchCommand must be used within CommandDispatchProvider");
  }
  return dispatchCommand;
}
