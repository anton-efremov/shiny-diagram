/**
 * @fileoverview Coordinates Shiny parsing, derivation, commands, and View composition.
 */

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";
import { parseDiagram } from "./parse";
import { deriveDiagramView } from "./deriveViews";
import { applyCommand } from "./commands";
import type { SourceEdit } from "./commands";
import { resolveIntents } from "./resolve";
import { translateCommands } from "./translate";
import type { DiagramGraph } from "./model/diagramGraph";
import type { ProvenanceIndex, SourceLocation } from "./model/provenanceIndex";
import type { ProvenanceIndex as OldProvenanceIndex } from "./model/provenanceIndexOld";
import type { ClassId } from "../shared/ids";
import { EditorView } from "../View/EditorRoot";
import type { EditorCommandTransaction, EditorDispatch } from "../View/commands";
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
  readonly malformedAnnotations?: ReadonlyMap<ClassId, SourceLocation>;
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

    const diagram = diagramView ?? { classes: [], namespaces: [], relationships: [] };
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
            malformedAnnotations:
              parseResult.status === "missingAnnotations"
                ? parseResult.malformedAnnotations
                : undefined,
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

    if (isTranslatedTransaction(transaction)) {
      const intents = translateCommands(transaction, context.graph, context.provenance);
      const edits = resolveIntents(intents, context.provenance, context.sourceText);
      if (edits.length > 0) {
        applyEdits(edits);
      }
      return;
    }

    const result = applyCommand(transaction, {
      ...context,
      provenance: toOldProvenance(context.provenance),
    });
    if (result.ok && result.edits.length > 0) {
      applyEdits(result.edits);
    }
  }, []);

  commandExecutionInputsRef.current = commandExecutionInputs;

  return <EditorView view={editorViewModel} onTransactionDispatch={dispatch} />;
}

function isTranslatedTransaction(transaction: EditorCommandTransaction): boolean {
  return transaction.every((command) => {
    switch (command.type) {
      case "class.create":
      case "class.duplicate":
      case "class.delete":
      case "class.spatial.set":
      case "class.directStyle.property.set":
        return true;
      default:
        return false;
    }
  });
}

function toOldProvenance(provenance: ProvenanceIndex): OldProvenanceIndex {
  return {
    classes: new Map([...provenance.classes.entries()].map(([id, record]) => [id, record.self])),
    members: new Map([...provenance.members.entries()].map(([id, record]) => [id, record.self])),
    namespaces: new Map(
      [...provenance.namespaces.entries()].map(([id, record]) => [id, record.self])
    ),
    styleDefinitions: new Map(
      [...provenance.styleDefinitions.entries()].map(([id, record]) => [id, record.self])
    ),
    relationships: new Map(
      [...provenance.relationships.entries()].map(([id, record]) => [id, record.self])
    ),
    classSpatial: new Map(
      [...provenance.classSpatial.entries()].map(([id, record]) => [id, record.self])
    ),
    namespaceMemberships: new Map(),
    styleApplications: new Map(
      [...provenance.styleApplications.entries()].map(([id, record]) => [id, record.self])
    ),
  };
}
