/**
 * @fileoverview Coordinates Shiny parsing, derivation, commands, and View composition.
 */

import { useCallback, useMemo } from "react";
import type { ReactElement } from "react";
import { parseDiagram } from "./parse";
import { deriveElementViews } from "./deriveViews";
import { applyCommand } from "./commands";
import type { SourceEdit } from "./commands";
import { EditorView } from "../shinyView/EditorView";
import type { EditorDispatch } from "../shinyView/commands";
import type { EditorViewModel, ElementViews } from "../shinyView/views";

type ShinyControllerProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};

/**
 * Provides parsed editor state and command dispatch to the Shiny editor.
 */
export default function ShinyController({
  sourceText,
  onApplyEdits,
}: ShinyControllerProps): ReactElement {
  const parseResult = useMemo(() => parseDiagram(sourceText), [sourceText]);

  const model = parseResult.status !== "invalidSyntax" ? parseResult.model : null;

  const elementViews: ElementViews | null = useMemo(() => {
    if (!model) return null;
    return deriveElementViews(model);
  }, [model]);

  const editorViewModel: EditorViewModel = useMemo(() => {
    if (parseResult.status === "invalidSyntax") {
      return {
        status: "invalidSyntax",
        message: parseResult.diagnostics[0]?.message ?? "Invalid syntax",
      };
    }

    const elements = elementViews ?? { classes: [], namespaces: [], relationships: [] };
    if (parseResult.status === "missingAnnotations") {
      return { status: "missingAnnotations", missingIds: parseResult.missingIds, elements };
    }
    return { status: "ready", elements };
  }, [parseResult, elementViews]);

  const dispatch: EditorDispatch = useCallback(
    (command) => {
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

  return <EditorView view={editorViewModel} dispatch={dispatch} />;
}
