/**
 * @fileoverview ClassDiagram child-view derivation.
 * Projects DiagramLayoutState and ClassDiagramView into the adapter render contract.
 */

import type { DiagramLayoutState } from "./state";
import type { ClassDiagramView } from "./views";
import type { ReactFlowCanvasAdapterView, ClassEntryView } from "./ReactFlowCanvasAdapter/views";

// @job logic:child:view
export function toClassDiagramChildView(
  state: DiagramLayoutState,
  view: ClassDiagramView
): ReactFlowCanvasAdapterView {
  const hasSoleSelection = view.selectedClassIds.length === 1;
  const selectedId = hasSoleSelection ? view.selectedClassIds[0] : undefined;

  const classes: ClassEntryView[] = view.elements.classes.flatMap((classView) => {
    const layout = state.layoutByClassId.get(classView.classId);
    if (!layout) return [];
    return [
      {
        classId: classView.classId,
        header: classView.header,
        members: classView.members,
        style: classView.style,
        x: layout.x,
        y: layout.y,
        w: layout.w,
        h: layout.h,
        isResizeVisible: hasSoleSelection && classView.classId === selectedId,
      },
    ];
  });

  return {
    classes,
    relationships: view.elements.relationships,
    selectedClassIds: view.selectedClassIds,
    isPlacementActive: view.placementMode !== null,
    placementOverlayView: { placementMode: view.placementMode },
  };
}
