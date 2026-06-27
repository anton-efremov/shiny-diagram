/**
 * @role [L] Logic
 * @logic Status-interface routing and status child-view construction.
 */
import type { ReactElement } from "react";
import type { EditorDispatch } from "../commands/editorCommands";
import CanvasView from "./CanvasView/CanvasView";
import { CommandDispatchContext } from "./contexts";
import ErrorView from "./ErrorView/ErrorView";
import MissingAnnotationsView from "./MissingAnnotationsView/MissingAnnotationsView";
import type { EditorViewModel } from "../views/schema";

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
        return <CanvasView view={view.diagram} />;
      }
      case "invalidSyntax": {
        return <ErrorView view={view} />;
      }
      case "missingAnnotations": {
        return <MissingAnnotationsView view={view} />;
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
