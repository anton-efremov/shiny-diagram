/**
 * @fileoverview Ready editor child-view derivation.
 */

import type { NodePlacementState, SelectionState } from "../../state/editorStates";
import type { ClassDiagramView } from "./ClassDiagram/views";
import type { StylePaneView } from "./StylePane/views";
import type { ToolPaneView } from "./ToolPane/views";
import type { CanvasViewModel } from "./views";

// @job logic:child:view
export function toToolPaneView(nodePlacementState: NodePlacementState): ToolPaneView {
  return { nodePlacementState };
}

export function toClassDiagramView(
  view: CanvasViewModel,
  selectionState: SelectionState,
  nodePlacementState: NodePlacementState
): ClassDiagramView {
  return {
    elements: {
      classes: view.elements.classes.map((classView) => ({
        classId: classView.classId,
        x: classView.x,
        y: classView.y,
        w: classView.w,
        h: classView.h,
        header: classView.header,
        members: classView.members,
        style: classView.style
          ? {
              fill: classView.style.fill,
              stroke: classView.style.stroke,
              color: classView.style.color,
            }
          : undefined,
      })),
      namespaces: view.elements.namespaces.map((namespaceView) => ({
        namespaceId: namespaceView.namespaceId,
        bounds: namespaceView.bounds,
        label: namespaceView.label,
        style: namespaceView.style,
      })),
      relationships: view.elements.relationships.map((relationshipView) => ({
        relationshipId: relationshipView.relationshipId,
        sourceClassId: relationshipView.sourceClassId,
        targetClassId: relationshipView.targetClassId,
        relationType: relationshipView.relationType,
        sourceMultiplicity: relationshipView.sourceMultiplicity,
        targetMultiplicity: relationshipView.targetMultiplicity,
        label: relationshipView.label,
      })),
    },
    selectionState,
    nodePlacementState,
  };
}

export function toStylePaneView(
  view: CanvasViewModel,
  selectionState: SelectionState
): StylePaneView {
  const selected = new Set(selectionState.classIds);
  return {
    classStylePane: {
      selectedClasses: view.elements.classes.flatMap((classView) => {
        if (!selected.has(classView.classId)) return [];
        return [
          {
            classId: classView.classId,
            label: classView.header.label,
            stereotype: classView.header.stereotype,
            styleName: classView.style?.name,
            style: {
              fill: classView.style?.fill,
              stroke: classView.style?.stroke,
              color: classView.style?.color,
            },
            position: { x: classView.x, y: classView.y },
            size: { width: classView.w, height: classView.h },
          },
        ];
      }),
    },
  };
}
