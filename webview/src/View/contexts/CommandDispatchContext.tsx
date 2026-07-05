/**
 * @fileoverview EditorView command dispatch context.
 * Provides the View-to-Controller command transport and its fail-fast consumer hook.
 */

import { createContext, useContext } from "react";
import type { ReactElement, ReactNode } from "react";
import type { EditorDispatch } from "../commands/editorCommands";

type CommandDispatchProviderProps = {
  readonly children: ReactNode;
  readonly onTransactionDispatch: EditorDispatch;
};

const CommandDispatchContext = createContext<EditorDispatch | null>(null);

export function CommandDispatchProvider({
  children,
  onTransactionDispatch,
}: CommandDispatchProviderProps): ReactElement {
  return (
    <CommandDispatchContext.Provider value={onTransactionDispatch}>
      {children}
    </CommandDispatchContext.Provider>
  );
}

export function useDispatchTransaction(): EditorDispatch {
  const dispatchCommand = useContext(CommandDispatchContext);
  if (!dispatchCommand) {
    throw new Error("useDispatchTransaction must be used within CommandDispatchProvider");
  }
  return dispatchCommand;
}
