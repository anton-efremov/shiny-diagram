/**
 * @role [L] Logic
 * @logic Status-interface routing and status child-view construction.
 */
import type { ReactElement } from "react";
import type { EditorDispatch } from "../commands/editorCommands";
import CanvasView from "./CanvasView/CanvasView";
import type { CanvasViewModel } from "./CanvasView/views";
import { CommandDispatchContext } from "./contexts";
import ErrorView from "./ErrorView/ErrorView";
import type { ErrorViewModel } from "./ErrorView/views";
import MissingAnnotationsView from "./MissingAnnotationsView/MissingAnnotationsView";
import type { MissingAnnotationsViewModel } from "./MissingAnnotationsView/views";
import type { EditorViewModel } from "./views";

type EditorViewProps = {
  view: EditorViewModel;
  dispatch: EditorDispatch;
};

// @job logic:child:view
function toCanvasView({
  view,
}: {
  readonly view: Extract<EditorViewModel, { readonly status: "ready" }>;
}): CanvasViewModel {
  return {
    elements: view.elements,
  };
}
function toErrorView({
  view,
}: {
  readonly view: Extract<EditorViewModel, { readonly status: "invalidSyntax" }>;
}): ErrorViewModel {
  return {
    message: view.message,
  };
}
function toMissingAnnotationsView({
  view,
}: {
  readonly view: Extract<EditorViewModel, { readonly status: "missingAnnotations" }>;
}): MissingAnnotationsViewModel {
  return {
    missingIds: view.missingIds,
    elements: view.elements,
  };
}

/**
 * Routes the visual editor to the current status interface.
 */
export default function EditorView({
  view,
  dispatch: dispatchCommand,
}: EditorViewProps): ReactElement {
  // @job logic:child:route
  const editorInterface = (() => {
    switch (view.status) {
      case "ready": {
        // @job logic:child:view
        const canvasView = toCanvasView({
          view,
        });
        return <CanvasView view={canvasView} />;
      }
      case "invalidSyntax": {
        // @job logic:child:view
        const errorView = toErrorView({
          view,
        });
        return <ErrorView view={errorView} />;
      }
      case "missingAnnotations": {
        // @job logic:child:view
        const missingAnnotationsView = toMissingAnnotationsView({
          view,
        });
        return <MissingAnnotationsView view={missingAnnotationsView} />;
      }
    }
  })();

  // @job connect:command:wire
  return (
    <CommandDispatchContext.Provider value={dispatchCommand}>
      {editorInterface}
    </CommandDispatchContext.Provider>
  );
}
