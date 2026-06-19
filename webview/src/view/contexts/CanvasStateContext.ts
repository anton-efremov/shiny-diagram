import { createContext, useContext } from "react";
import type { CanvasState } from "./canvasState";

type CanvasStateContextValue = {
  readonly canvasState: CanvasState;
  readonly setCanvasState: (update: Partial<CanvasState>) => void;
};

export const CanvasStateContext = createContext<CanvasStateContextValue | null>(null);

export function useCanvasState(): CanvasStateContextValue {
  const ctx = useContext(CanvasStateContext);
  if (!ctx) throw new Error("useCanvasState must be used within AppController");
  return ctx;
}
