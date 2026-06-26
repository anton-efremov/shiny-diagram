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
    elements: view.elements,
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
    selectedClassViews: view.elements.classes.filter((classView) =>
      selected.has(classView.classId)
    ),
  };
}
