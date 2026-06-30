/**
 * @behavior Editor status interface routing and command dispatch context provision.
 */
import type { ReactElement } from "react";
import type { EditorViewModel } from "../views/schema";
import type { EditorDispatch } from "../commands/editorCommands";
import { CommandDispatchProvider } from "../contexts";
import EditorSurface from "./EditorSurface/EditorSurface";
import ErrorSurface from "./ErrorSurface/ErrorSurface";
import MissingAnnotationsSurface from "./MissingAnnotationsSurface/MissingAnnotationsSurface";

type EditorRootProps = {
  readonly view: EditorViewModel;
  readonly onTransactionDispatch: EditorDispatch;
};

export default function EditorRoot({ view, onTransactionDispatch }: EditorRootProps): ReactElement {
  /** Child component routing: editor status interface selection. */
  let editorInterface: ReactElement;
  switch (view.status) {
    case "ready": {
      editorInterface = <EditorSurface view={view.diagram} />;
      break;
    }
    case "invalidSyntax": {
      editorInterface = <ErrorSurface message={view.message} />;
      break;
    }
    case "missingAnnotations": {
      editorInterface = <MissingAnnotationsSurface view={view} />;
      break;
    }
  }

  return (
    <CommandDispatchProvider onTransactionDispatch={onTransactionDispatch}>
      {editorInterface}
    </CommandDispatchProvider>
  );
}
