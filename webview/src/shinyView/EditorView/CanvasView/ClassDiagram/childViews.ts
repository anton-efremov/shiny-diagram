/**
 * @fileoverview ClassDiagram child-view derivation.
 * Projects ClassBoxLayoutState and ClassDiagramView into the adapter render contract.
 */

import type { ClassBoxLayoutState } from "../../../state/editorStates";
import type { ClassDiagramView } from "./views";
import type { ReactFlowCanvasAdapterView, ClassEntryView } from "./ReactFlowCanvasAdapter/views";

// @job logic:child:view
export function toClassDiagramChildView(
  state: ClassBoxLayoutState,
  view: ClassDiagramView
): ReactFlowCanvasAdapterView {
  const { classIds } = view.selectionState;
  const hasSoleSelection = classIds.length === 1;
  const selectedId = hasSoleSelection ? classIds[0] : undefined;

  const classes: ClassEntryView[] = view.elements.classes.flatMap((classView) => {
    const layout = state.rectByClassId.get(classView.classId);
    if (!layout) return [];
    return [
      {
        classId: classView.classId,
        header: classView.header,
        members: classView.members.map((member) => ({
          memberId: member.memberId,
          prefix: member.prefix,
          text: member.text,
          kind: member.kind,
        })),
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
    relationships: view.elements.relationships.map((relationshipView) => ({
      relationshipId: relationshipView.relationshipId,
      sourceClassId: relationshipView.sourceClassId,
      targetClassId: relationshipView.targetClassId,
      relationType: relationshipView.relationType,
      sourceMultiplicity: relationshipView.sourceMultiplicity,
      targetMultiplicity: relationshipView.targetMultiplicity,
      label: relationshipView.label,
    })),
    selectedClassIds: classIds,
    isPlacementActive: view.nodePlacementState !== null,
    placementOverlayView: { nodePlacementState: view.nodePlacementState },
  };
}
