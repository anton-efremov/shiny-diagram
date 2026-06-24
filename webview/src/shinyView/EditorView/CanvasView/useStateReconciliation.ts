/**
 * @fileoverview Prop-driven reconciliation for CanvasView-owned state.
 */

import { useEffect } from "react";
import type { CanvasViewModel } from "./views";

// @job-helper logic:state:reconcile
export function useStateReconciliation(
  view: CanvasViewModel,
  reconcileSelectionWithElements: (elements: CanvasViewModel["elements"]) => void
): void {
  useEffect(() => {
    reconcileSelectionWithElements(view.elements);
  }, [reconcileSelectionWithElements, view.elements]);
}
