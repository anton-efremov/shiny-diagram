import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { parseDiagram } from "./parse";
import type { ParseResult } from "./parse";
import { deriveElementViews } from "./deriveViews";
import { applyCommand } from "./commands";
import type { EditorCommand } from "./commands";
import type { ElementViews } from "./deriveViews";
import type { SourceEdit } from "../primitives";
import { defaultCanvasState, type CanvasState } from "../view/contexts/canvasState";
import { CanvasStateContext } from "../view/contexts/CanvasStateContext";
import { EditorDispatchContext } from "../view/contexts/EditorDispatchContext";
import { EditorStateContext, type EditorHeaderState } from "../view/contexts/EditorStateContext";
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
  const [canvasState, setCanvasStateRaw] = useState<CanvasState>(defaultCanvasState);

  const parseResult = useMemo(() => parseDiagram(sourceText), [sourceText]);

  const model = parseResult.status !== "invalidSyntax" ? parseResult.model : null;

  const elementViews: ElementViews | null = useMemo(() => {
    if (!model) return null;
    return deriveElementViews(model);
  }, [model]);

  useEffect(() => {
    setCanvasStateRaw((prev) => {
      if (!prev.selectedClassId) return prev;
      const stillExists = elementViews?.classes.some((v) => v.classId === prev.selectedClassId);
      return stillExists ? prev : defaultCanvasState;
    });
  }, [elementViews]);

  const dispatch = useCallback(
    (command: EditorCommand) => {
      if (!model || !elementViews) return;

      const context = {
        sourceText,
        model,
        views: elementViews,
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

  const setCanvasState = useCallback((update: Partial<CanvasState>) => {
    setCanvasStateRaw((prev) => ({ ...prev, ...update }));
  }, []);

  const canvasStateContext = useMemo(
    () => ({ canvasState, setCanvasState }),
    [canvasState, setCanvasState]
  );

  const stateContext = useMemo(
    () => ({ sourceText, parseStatus: toHeaderState(parseResult), elementViews }),
    [sourceText, parseResult, elementViews]
  );

  return (
    <EditorDispatchContext.Provider value={dispatch}>
      <CanvasStateContext.Provider value={canvasStateContext}>
        <EditorStateContext.Provider value={stateContext}>
          <App />
        </EditorStateContext.Provider>
      </CanvasStateContext.Provider>
    </EditorDispatchContext.Provider>
  );
}
