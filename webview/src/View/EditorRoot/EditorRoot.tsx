/**
 * @behavior Editor status interface routing and command dispatch context provision.
 */
import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import type { EditorViewModel } from "../views/schema";
import type { EditorDispatch } from "../commands/editorCommands";
import { CommandDispatchProvider } from "../contexts";
import EditorSurface from "./EditorSurface/EditorSurface";
import { toMissingAnnotationsGenerateTransaction } from "./transactions";
import ViewportFrame from "../../ui/chrome/templates/ViewportFrame/ViewportFrame";

type EditorRootProps = {
  readonly view: EditorViewModel;
  readonly onTransactionDispatch: EditorDispatch;
  readonly generateRequest: number;
};

export default function EditorRoot({
  view,
  onTransactionDispatch,
  generateRequest,
}: EditorRootProps): ReactElement {
  // State creation: local record of the latest handled generation request
  const handledGenerateRequest = useRef(generateRequest);

  // State reconciliation
  useEffect(() => {
    if (view.status !== "missingAnnotations") return;
    if (generateRequest <= handledGenerateRequest.current) return;
    handledGenerateRequest.current = generateRequest;
    const transaction = toMissingAnnotationsGenerateTransaction(view.diagram, view.missingClasses);
    if (transaction.length > 0) onTransactionDispatch(transaction);
  }, [generateRequest, onTransactionDispatch, view]);

  // Child component routing
  if (view.status !== "ready") return <></>;

  return (
    <CommandDispatchProvider onTransactionDispatch={onTransactionDispatch}>
      <ViewportFrame>
        <EditorSurface view={view.diagram} />
      </ViewportFrame>
    </CommandDispatchProvider>
  );
}
