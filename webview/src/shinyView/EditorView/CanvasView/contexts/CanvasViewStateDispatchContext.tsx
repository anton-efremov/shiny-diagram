import { createContext, useContext } from "react";
import type { Dispatch } from "react";
import type { CanvasViewStateAction } from "../state";

export const CanvasViewStateDispatchContext = createContext<Dispatch<CanvasViewStateAction> | null>(
  null
);

export function useDispatchCanvasViewStateAction(): Dispatch<CanvasViewStateAction> {
  const dispatchCanvasViewStateAction = useContext(CanvasViewStateDispatchContext);
  if (!dispatchCanvasViewStateAction) {
    throw new Error("useDispatchCanvasViewStateAction must be used within CanvasView");
  }
  return dispatchCanvasViewStateAction;
}
