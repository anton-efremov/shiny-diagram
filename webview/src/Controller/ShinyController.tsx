/**
 * @fileoverview Coordinates Shiny parsing, derivation, writeback, and View composition.
 */

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";
import { parseDiagram } from "./parse";
import { deriveDiagramView } from "./deriveViews";
import { resolveIntents } from "./resolve";
import { translateCommands } from "./translate";
import type { DiagramGraph } from "./model/diagramGraph";
import type { ProvenanceIndex } from "./model/provenanceIndex";
import type { SourceEdit } from "./model/sourceEdit";
import { EditorView } from "../View/EditorRoot";
import type { EditorDispatch } from "../View/commands";
import type { DiagramView, EditorViewModel } from "../View/views";

type ShinyControllerProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};

type CommandExecutionInputs = {
  readonly context: NewCommandContext | null;
  readonly onApplyEdits: (edits: SourceEdit[]) => void;
};

type NewCommandContext = {
  readonly sourceText: string;
  readonly graph: DiagramGraph;
  readonly provenance: ProvenanceIndex;
};

/**
 * Provides parsed editor state and command dispatch to the Shiny editor.
 */
export default function ShinyController({
  sourceText,
  onApplyEdits,
}: ShinyControllerProps): ReactElement {
  const parseResult = useMemo(() => parseDiagram(sourceText), [sourceText]);

  const graph = parseResult.status !== "invalidSyntax" ? parseResult.graph : null;
  const provenance = parseResult.status !== "invalidSyntax" ? parseResult.provenance : null;

  const diagramView: DiagramView | null = useMemo(() => {
    if (!graph) return null;
    return deriveDiagramView(graph);
  }, [graph]);

  const editorViewModel: EditorViewModel = useMemo(() => {
    if (parseResult.status === "invalidSyntax") {
      return {
        status: "invalidSyntax",
        message: parseResult.diagnostics[0]?.message ?? "Invalid syntax",
      };
    }

    const diagram = diagramView ?? { classes: [], namespaces: [], relationships: [], styles: [] };
    if (parseResult.status === "missingAnnotations") {
      return {
        status: "missingAnnotations",
        missingClassIds: parseResult.missingIds,
        diagram,
      };
    }
    return { status: "ready", diagram };
  }, [parseResult, diagramView]);

  const commandExecutionInputs: CommandExecutionInputs = {
    context:
      graph && provenance
        ? {
            sourceText,
            graph,
            provenance,
          }
        : null,
    onApplyEdits,
  };
  const commandExecutionInputsRef = useRef<CommandExecutionInputs>(commandExecutionInputs);

  useLayoutEffect(() => {
    commandExecutionInputsRef.current = commandExecutionInputs;
  });

  const dispatch: EditorDispatch = useCallback((transaction) => {
    const { context, onApplyEdits: applyEdits } = commandExecutionInputsRef.current;
    if (!context) return;

    const intents = translateCommands(
      transaction,
      context.graph,
      context.provenance,
      context.sourceText
    );
    const edits = resolveIntents(intents, context.provenance, context.sourceText);
    if (edits.length > 0) {
      applyEdits(edits);
    }
  }, []);

  commandExecutionInputsRef.current = commandExecutionInputs;

  return <EditorView view={editorViewModel} onTransactionDispatch={dispatch} />;
}
