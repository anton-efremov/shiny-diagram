import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { parseDiagram } from "../domain/classDiagram/parse";
import { deriveElementViews } from "../domain/classDiagram/derive";
import { applyCommand } from "../domain/classDiagram/commands";
import type { EditorCommand } from "../domain/classDiagram/commands/commandTypes";
import type { ElementViews } from "../domain/classDiagram/derive/viewModel";
import type { SourceEdit } from "../domain/classDiagram/source/sourceEditTypes";
import { readClassBoxMetrics } from "./classBoxMetrics";
import { emptySelection, type Selection } from "./selection";
import ClassDiagram from "./components/ClassDiagram";
import StylePane from "./components/StylePane";
import ToolPane from "./components/ToolPane";
import styles from "./EditorCoordinator.module.css";

export type EditorHeaderState =
  | { readonly status: "ready" }
  | { readonly status: "invalidSyntax"; readonly message: string }
  | { readonly status: "missingAnnotations"; readonly missingIds: readonly string[] };

export type EditorCoordinatorHandle = {
  dispatch: (command: EditorCommand) => void;
};

type EditorCoordinatorProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
  onHeaderStateChange: (state: EditorHeaderState) => void;
};

const EditorCoordinator = forwardRef<EditorCoordinatorHandle, EditorCoordinatorProps>(
  function EditorCoordinator({ sourceText, onApplyEdits, onHeaderStateChange }, ref) {
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

    useEffect(() => {
      let headerState: EditorHeaderState;
      if (parseResult.status === "invalidSyntax") {
        headerState = {
          status: "invalidSyntax",
          message: parseResult.diagnostics[0]?.message ?? "Invalid syntax",
        };
      } else if (parseResult.status === "missingAnnotations") {
        headerState = { status: "missingAnnotations", missingIds: parseResult.missingIds };
      } else {
        headerState = { status: "ready" };
      }
      onHeaderStateChange(headerState);
    }, [parseResult, onHeaderStateChange]);

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

    useImperativeHandle(ref, () => ({ dispatch }), [dispatch]);

    const handleSelectionChange = useCallback((next: Selection) => {
      setSelection(next);
    }, []);

    const selectedView = elementViews?.classes.find(
      (v) => v.classId === selection.selectedClassId
    );

    if (parseResult.status === "invalidSyntax") {
      return (
        <section className={styles.editorShell} aria-label="Class diagram editor">
          <ToolPane />
          <div className={styles.canvasRegion}>
            <div className={styles.errorCanvas}>
              <p className={styles.errorMessage}>
                {parseResult.diagnostics[0]?.message ?? "Invalid syntax"}
              </p>
            </div>
          </div>
          <StylePane selectedView={undefined} dispatch={dispatch} />
        </section>
      );
    }

    if (parseResult.status === "missingAnnotations") {
      return (
        <section className={styles.editorShell} aria-label="Class diagram editor">
          <ToolPane />
          <div className={styles.canvasRegion}>
            <div className={styles.missingCanvas}>
              <p className={styles.missingLabel}>Classes without spatial annotations:</p>
              <ul className={styles.missingList}>
                {parseResult.missingIds.map((id) => (
                  <li key={id} className={styles.missingItem}>
                    {id}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <StylePane selectedView={undefined} dispatch={dispatch} />
        </section>
      );
    }

    return (
      <section className={styles.editorShell} aria-label="Class diagram editor">
        <ToolPane />
        <div className={styles.canvasRegion}>
          {elementViews ? (
            <ClassDiagram
              views={elementViews}
              selection={selection}
              dispatch={dispatch}
              onSelectionChange={handleSelectionChange}
            />
          ) : null}
        </div>
        <StylePane selectedView={selectedView} dispatch={dispatch} />
      </section>
    );
  }
);

export default EditorCoordinator;
