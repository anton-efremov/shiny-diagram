/**
 * @fileoverview Ready editor child-view derivation.
 */

import type { ClassId } from "../../../shared/ids";
import type { ClassDiagramView } from "./ClassDiagram/views";
import type { EditorState } from "./state";
import type { StylePaneView } from "./StylePane/views";
import type { ToolPaneView } from "./ToolPane/views";
import type { CanvasViewModel } from "./views";

// @job-helper logic:child-view
export function toToolPaneView(editorState: EditorState): ToolPaneView {
  return { placementMode: editorState.placementMode };
}

// @job-helper logic:child-view
export function toClassDiagramView(
  view: CanvasViewModel,
  editorState: EditorState
): ClassDiagramView {
  return {
    elements: view.elements,
    selectedClassIds: editorState.selectedClassIds,
    placementMode: editorState.placementMode,
  };
}

// @job-helper logic:child-view
export function toStylePaneView(
  view: CanvasViewModel,
  selectedClassIds: readonly ClassId[]
): StylePaneView {
  const selected = new Set(selectedClassIds);
  return {
    selectedClassViews: view.elements.classes.filter((classView) =>
      selected.has(classView.classId)
    ),
  };
}
