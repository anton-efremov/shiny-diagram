import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { parseDiagram } from "./parse";
import type { ParseResult } from "./parse";
import { deriveElementViews } from "./derive";
import { applyCommand } from "./commands";
import type { EditorCommand } from "./commands/commandTypes";
import type { ElementViews } from "./derive/viewModel";
import type { SourceEdit } from "./source/sourceEditTypes";
import { readClassBoxMetrics } from "./classBoxMetrics";
import { emptySelection, type Selection } from "./selection";
import { EditorDispatchContext } from "./EditorDispatchContext";
import { EditorSelectionContext } from "./EditorSelectionContext";
import { EditorStateContext, type EditorHeaderState } from "./EditorStateContext";
import App from "../view/App";

type AppControllerProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};

function toHeaderState(parseResult: ParseResult): EditorHeaderState {
  if (parseResult.status === "invalidSyntax") {
    return { status: "invalidSyntax", message: parseResult.diagnostics[0]?.message ?? "Invalid syntax" };
  }
  if (parseResult.status === "missingAnnotations") {
    return { status: "missingAnnotations", missingIds: parseResult.missingIds };
  }
  return { status: "ready" };
}

export default function AppController({ sourceText, onApplyEdits }: AppControllerProps): ReactElement {
  const [selection, setSelection] = useState<Selection>(emptySelection);

  const parseResult = useMemo(() => parseDiagram(sourceText), [sourceText]);

  const model = parseResult.status !== "invalidSyntax" ? parseResult.model : null;

  const elementViews: ElementViews | null = useMemo(() => {
    if (!model) return null;
    return deriveElementViews(model);
  }, [model]);

  useEffect(() => {
    setSelection((prev) => {
      if (!prev.selectedClassId) return prev;
      const stillExists = elementViews?.classes.some((v) => v.classId === prev.selectedClassId);
      return stillExists ? prev : emptySelection;
    });
  }, [elementViews]);

  const dispatch = useCallback(
    (command: EditorCommand) => {
      if (!model || !elementViews) return;

      const context = {
        sourceText,
        model,
        views: elementViews,
        classBoxMetrics: readClassBoxMetrics(),
        malformedAnnotations:
          parseResult.status === "missingAnnotations"
            ? parseResult.malformedAnnotations
            : undefined,
      };

      const result = applyCommand(command, context);
      if (result.ok && result.edits.length > 0) {
        onApplyEdits(result.edits);
      }
    },
    [sourceText, model, elementViews, parseResult, onApplyEdits]
  );

  const handleSelectionChange = useCallback((next: Selection) => {
    setSelection(next);
  }, []);

  const selectionContext = useMemo(
    () => ({ selection, onSelectionChange: handleSelectionChange }),
    [selection, handleSelectionChange]
  );

  const stateContext = useMemo(
    () => ({ sourceText, parseStatus: toHeaderState(parseResult), elementViews }),
    [sourceText, parseResult, elementViews]
  );

  return (
    <EditorDispatchContext.Provider value={dispatch}>
      <EditorSelectionContext.Provider value={selectionContext}>
        <EditorStateContext.Provider value={stateContext}>
          <App />
        </EditorStateContext.Provider>
      </EditorSelectionContext.Provider>
    </EditorDispatchContext.Provider>
  );
}
