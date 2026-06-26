/**
 * @role [L] Logic
 * @logic Status-interface routing and status child-view construction.
 */
import type { ReactElement } from "react";
import type { EditorDispatch } from "../commands/editorCommands";
import CanvasView from "./CanvasView/CanvasView";
import { toCanvasView, toErrorView, toMissingAnnotationsView } from "./childViews";
import { CommandDispatchContext } from "./contexts";
import ErrorView from "./ErrorView/ErrorView";
import MissingAnnotationsView from "./MissingAnnotationsView/MissingAnnotationsView";
import type { EditorViewModel } from "./views";

type EditorViewProps = {
  view: EditorViewModel;
  dispatch: EditorDispatch;
};

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
