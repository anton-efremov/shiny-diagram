/**
 * @fileoverview React context providing canvas interaction state to View components.
 */

import { createContext, useContext } from "react";
import type { CanvasState } from "./canvasState";

type CanvasStateContextValue = {
  readonly canvasState: CanvasState;
  readonly setCanvasState: (update: Partial<CanvasState>) => void;
};

export const CanvasStateContext = createContext<CanvasStateContextValue | null>(null);

/**
 * Consumes canvas interaction state within a descendant of AppController.
 */
export function useCanvasState(): CanvasStateContextValue {
  const ctx = useContext(CanvasStateContext);
  if (!ctx) throw new Error("useCanvasState must be used within AppController");
  return ctx;
}
