/**
 * @fileoverview Coordinates Shiny parsing, derivation, commands, and View composition.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { parseDiagram } from "./parse";
import type { ParseResult } from "./parse";
import { deriveElementViews } from "./deriveViews";
import { applyCommand } from "./commands";
import type { SourceEdit } from "./commands";
import { EditorView } from "../shinyView/EditorView";
import {
  CanvasStateContext,
  defaultCanvasState,
  EditorDispatchContext,
  EditorStateContext,
} from "../shinyView/contexts";
import type { CanvasState } from "../shinyView/contexts";
import type { EditorCommand } from "../shinyView/commands";
import type { EditorStatusView, ElementViews } from "../shinyView/views";
import type { ClassId } from "../shared/ids";

type ShinyControllerProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};

type PendingSelection = {
  readonly classIds: readonly ClassId[];
  readonly sourceText: string;
};

function toEditorStatusView(parseResult: ParseResult): EditorStatusView {
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
 * Provides parsed editor state and command dispatch to the Shiny editor.
 */
export default function ShinyController({
  sourceText,
  onApplyEdits,
}: ShinyControllerProps): ReactElement {
  const [canvasState, setCanvasStateRaw] = useState<CanvasState>(defaultCanvasState);
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);

  const parseResult = useMemo(() => parseDiagram(sourceText), [sourceText]);

  const model = parseResult.status !== "invalidSyntax" ? parseResult.model : null;

  const elementViews: ElementViews | null = useMemo(() => {
    if (!model) return null;
    return deriveElementViews(model);
  }, [model]);

  useEffect(() => {
    setCanvasStateRaw((prev) => {
      const classIds = reconcileSelectedClassIds(prev.selectedClassIds, elementViews);
      return areClassIdCollectionsEqual(prev.selectedClassIds, classIds)
        ? prev
        : { ...prev, selectedClassIds: classIds };
    });
  }, [elementViews]);

  useEffect(() => {
    if (!pendingSelection || pendingSelection.sourceText === sourceText) return;

    const availableClassIds = new Set(elementViews?.classes.map((view) => view.classId) ?? []);
    const createdClassesExist = pendingSelection.classIds.every((classId) =>
      availableClassIds.has(classId)
    );

    if (createdClassesExist) {
      setCanvasStateRaw((prev) => ({ ...prev, selectedClassIds: pendingSelection.classIds }));
    }

    setPendingSelection(null);
  }, [sourceText, elementViews, pendingSelection]);

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
        if (result.createdClassIds) {
          setPendingSelection({ classIds: result.createdClassIds, sourceText });
        }
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
    () => ({ editorStatus: toEditorStatusView(parseResult), elementViews }),
    [parseResult, elementViews]
  );

  return (
    <EditorDispatchContext.Provider value={dispatch}>
      <CanvasStateContext.Provider value={canvasStateContext}>
        <EditorStateContext.Provider value={stateContext}>
          <EditorView />
        </EditorStateContext.Provider>
      </CanvasStateContext.Provider>
    </EditorDispatchContext.Provider>
  );
}

function reconcileSelectedClassIds(
  selectedClassIds: readonly ClassId[],
  elementViews: ElementViews | null
): readonly ClassId[] {
  if (selectedClassIds.length === 0) return selectedClassIds;

  const selected = new Set(selectedClassIds);
  return (
    elementViews?.classes.flatMap((view) => (selected.has(view.classId) ? [view.classId] : [])) ??
    []
  );
}

function areClassIdCollectionsEqual(left: readonly ClassId[], right: readonly ClassId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
