/**
 * @fileoverview Prop-driven reconciliation for ClassDiagram-owned React Flow state.
 */

import { useEffect, useRef } from "react";
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
  const selectedClassIdsRef = useRef(view.selectedClassIds);
  selectedClassIdsRef.current = view.selectedClassIds;

  useEffect(() => {
    rebuildNodesFromClassViews(view.elements.classes, selectedClassIdsRef.current);
  }, [rebuildNodesFromClassViews, view.elements.classes]);

  useEffect(() => {
    projectSelectionToNodes(view.selectedClassIds);
  }, [projectSelectionToNodes, view.selectedClassIds]);
}
