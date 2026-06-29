/**
 * @role  [L]
 * @logic Status interface routing and command dispatch context provision.
 */
import type { ReactElement } from "react";
import type { EditorDispatch } from "../commands/editorCommands";
import CanvasView from "./CanvasView/CanvasView";
import { CommandDispatchContext } from "./contexts";
import ErrorView from "./ErrorView/ErrorView";
import MissingAnnotationsView from "./MissingAnnotationsView/MissingAnnotationsView";
import type { EditorViewModel } from "../views/schema";

type EditorViewProps = {
  readonly view: EditorViewModel;
  readonly onTransactionDispatch: EditorDispatch;
};

export default function EditorView({ view, onTransactionDispatch }: EditorViewProps): ReactElement {
  /** ── routing area ──
   * Children routing decision.
   */
  let editorInterface: ReactElement;
  switch (view.status) {
    case "ready": {
      editorInterface = <CanvasView view={view.diagram} />;
      break;
    }
    case "invalidSyntax": {
      editorInterface = <ErrorView view={view} />;
      break;
    }
    case "missingAnnotations": {
      editorInterface = <MissingAnnotationsView view={view} />;
      break;
    }
  }

  return (
    <CommandDispatchContext.Provider value={onTransactionDispatch}>
      {editorInterface}
    </CommandDispatchContext.Provider>
  );
}
