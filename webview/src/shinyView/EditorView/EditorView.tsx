/**
 * @role [H] Hub
 * @coordinates Editor shell branches across status, tools, canvas, and styles.
 * @logic Status-specific editor branch selection.
 */
import { useEffect, useMemo, useReducer } from "react";
import type { ReactElement } from "react";
import type { EditorDispatch } from "../commands/editorCommand";
import CanvasView from "./CanvasView/CanvasView";
import type { CanvasViewModel } from "./CanvasView/views";
import type { ClassDiagramView } from "./CanvasView/ClassDiagram/views";
import { CommandDispatchProvider, EditorStateDispatchProvider } from "./contexts";
import { editorStateReducer, initialEditorState } from "./editorState";
import ErrorView from "./ErrorView/ErrorView";
import type { ErrorViewModel } from "./ErrorView/views";
import MissingAnnotationsView from "./MissingAnnotationsView/MissingAnnotationsView";
import type { MissingAnnotationsViewModel } from "./MissingAnnotationsView/views";
import type { StylePaneView } from "./CanvasView/StylePane/views";
import type { ToolPaneView } from "./CanvasView/ToolPane/views";
import type { EditorViewModel } from "./views";

type EditorViewProps = {
  view: EditorViewModel;
  dispatch: EditorDispatch;
};

// @job-helper logic:child-view
function toToolPaneView(placementMode: ToolPaneView["placementMode"]): ToolPaneView {
  return { placementMode };
}

// @job-helper logic:child-view
function toStylePaneView(selectedClassViews: StylePaneView["selectedClassViews"]): StylePaneView {
  return { selectedClassViews };
}

// @job-helper logic:child-view
function toCanvasView({
  view,
  toolPaneView,
  stylePaneView,
  selectedClassIds,
}: {
  readonly view: Extract<EditorViewModel, { readonly status: "ready" }>;
  readonly toolPaneView: ToolPaneView;
  readonly stylePaneView: StylePaneView;
  readonly selectedClassIds: ClassDiagramView["selectedClassIds"];
}): CanvasViewModel {
  const classDiagramView: ClassDiagramView = {
    elements: view.elements,
    selectedClassIds,
    placementMode: toolPaneView.placementMode,
  };

  return {
    toolPaneView,
    classDiagramView,
    stylePaneView,
  };
}

// @job-helper logic:child-view
function toErrorView({
  view,
}: {
  readonly view: Extract<EditorViewModel, { readonly status: "invalidSyntax" }>;
}): ErrorViewModel {
  return {
    message: view.message,
  };
}

// @job-helper logic:child-view
function toMissingAnnotationsView({
  view,
}: {
  readonly view: Extract<EditorViewModel, { readonly status: "missingAnnotations" }>;
}): MissingAnnotationsViewModel {
  return {
    missingIds: view.missingIds,
  };
}

/**
 * Coordinates the visual class-diagram editor shell.
 */
export default function EditorView({
  view,
  dispatch: dispatchCommand,
}: EditorViewProps): ReactElement {
  
  // @job coordinate:shared-state
  const [editorState, dispatchEditorStateAction] = useReducer(
    editorStateReducer,
    initialEditorState
  );

  // @job coordinate:branch-views
  const elements = view.status === "invalidSyntax" ? null : view.elements;

  // @job logic:state
  useEffect(() => {
    dispatchEditorStateAction({
      type: "selection.reconcileClassIds",
      elements,
    });
  }, [elements]);

  // @job coordinate:branch-views
  const selectedClassViews = useMemo(() => {
    const selected = new Set(editorState.selectedClassIds);
    return elements?.classes.filter((classView) => selected.has(classView.classId)) ?? [];
  }, [elements, editorState.selectedClassIds]);

  // @job logic:child-view
  const toolPaneView = toToolPaneView(editorState.placementMode);

  // @job logic:child-view
  const stylePaneView = toStylePaneView(selectedClassViews);

  // @job coordinate:branch-views
  const editorInterface = (() => {
    switch (view.status) {
      case "ready": {
        // @job logic:child-view
        const canvasView = toCanvasView({
          view,
          toolPaneView,
          stylePaneView,
          selectedClassIds: editorState.selectedClassIds,
        });
        return <CanvasView view={canvasView} />;
      }
      case "invalidSyntax": {
        // @job logic:child-view
        const errorView = toErrorView({
          view,
        });
        return <ErrorView view={errorView} />;
      }
      case "missingAnnotations": {
        // @job logic:child-view
        const missingAnnotationsView = toMissingAnnotationsView({
          view,
        });
        return <MissingAnnotationsView view={missingAnnotationsView} />;
      }
    }
  })();

  // @job coordinate:providers
  return (
    <CommandDispatchProvider dispatchCommand={dispatchCommand}>
      <EditorStateDispatchProvider dispatchEditorStateAction={dispatchEditorStateAction}>
        {editorInterface}
      </EditorStateDispatchProvider>
    </CommandDispatchProvider>
  );
}
