/**
 * @fileoverview Coordinates Controller parsing, derivation, commands, and View composition.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { parseDiagram } from "./parse";
import type { ParseResult } from "./parse";
import { deriveElementViews } from "./deriveViews";
import { applyCommand } from "./commands";
import type { SourceEdit } from "./commands";
import {
  App,
  CanvasStateContext,
  defaultCanvasState,
  EditorDispatchContext,
  EditorStateContext,
} from "../view";
import type { CanvasState } from "../view";
import type { EditorCommand } from "../view/commands";
import type { EditorHeaderState, ElementViews } from "../view/views";

type AppControllerProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};

function toHeaderState(parseResult: ParseResult): EditorHeaderState {
  if (parseResult.status === "invalidSyntax") {
    return {
      status: "invalidSyntax",
      message: parseResult.diagnostics[0]?.message ?? "Invalid syntax",
    };
  }
  if (parseResult.status === "missingAnnotations") {
    return { status: "missingAnnotations", missingIds: parseResult.missingIds };
  }
  return { status: "ready" };
}

/**
 * Provides parsed editor state and command dispatch to the webview application.
 */
export default function AppController({
  sourceText,
  onApplyEdits,
}: AppControllerProps): ReactElement {
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
      return stillExists ? prev : { ...prev, selectedClassId: null };
    });
  }, [elementViews]);

  const dispatch = useCallback(
    (command: EditorCommand) => {
      if (!model) return;

      const context = {
        sourceText,
        model,
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
    [sourceText, model, parseResult, onApplyEdits]
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
