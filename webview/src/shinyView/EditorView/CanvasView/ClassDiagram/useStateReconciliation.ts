/**
 * @fileoverview Prop-driven reconciliation for ClassDiagram-owned React Flow state.
 */

import { useEffect } from "react";
import type { ClassId } from "../../../../shared/ids";
import type { ClassBoxView } from "./ClassBox/views";
import type { ClassDiagramView } from "./views";

// @job-helper logic:state:reconcile
export function useStateReconciliation(
  view: ClassDiagramView,
  rebuildNodesFromClassViews: (
    classes: readonly ClassBoxView[],
    selectedClassIds: readonly ClassId[]
  ) => void,
  projectSelectionToNodes: (selectedClassIds: readonly ClassId[]) => void
): void {
  useEffect(() => {
    rebuildNodesFromClassViews(view.elements.classes, view.selectedClassIds);
  }, [rebuildNodesFromClassViews, view.elements.classes, view.selectedClassIds]);

  useEffect(() => {
    projectSelectionToNodes(view.selectedClassIds);
  }, [projectSelectionToNodes, view.selectedClassIds]);
}
