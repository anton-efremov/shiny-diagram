import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { parseDiagram } from "./parse";
import { deriveElementViews } from "./derive";
import { applyCommand } from "./commands";
import type { EditorCommand } from "./commands/commandTypes";
import type { ElementViews } from "./derive/viewModel";
import type { SourceEdit } from "./source/sourceEditTypes";
import { readClassBoxMetrics } from "./classBoxMetrics";
import { emptySelection, type Selection } from "./selection";
import { EditorDispatchContext } from "./EditorDispatchContext";
import { EditorSelectionContext } from "./EditorSelectionContext";
import ClassDiagram from "../view/editor/ClassDiagram/ClassDiagram";
import StylePane from "../view/editor/StylePane/StylePane";
import ToolPane from "../view/editor/ToolPane/ToolPane";
import styles from "./AppController.module.css";

export type EditorHeaderState =
  | { readonly status: "ready" }
  | { readonly status: "invalidSyntax"; readonly message: string }
  | { readonly status: "missingAnnotations"; readonly missingIds: readonly string[] };

export type AppControllerHandle = {
  dispatch: (command: EditorCommand) => void;
};

type AppControllerProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
  onHeaderStateChange: (state: EditorHeaderState) => void;
};

const AppController = forwardRef<AppControllerHandle, AppControllerProps>(
  function AppController({ sourceText, onApplyEdits, onHeaderStateChange }, ref) {
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

    const selectionContext = useMemo(
      () => ({ selection, onSelectionChange: handleSelectionChange }),
      [selection, handleSelectionChange]
    );

    const selectedView = elementViews?.classes.find(
      (v) => v.classId === selection.selectedClassId
    );

    if (parseResult.status === "invalidSyntax") {
      return (
        <EditorDispatchContext.Provider value={dispatch}>
          <EditorSelectionContext.Provider value={selectionContext}>
            <section className={styles.editorShell} aria-label="Class diagram editor">
              <ToolPane />
              <div className={styles.canvasRegion}>
                <div className={styles.errorCanvas}>
                  <p className={styles.errorMessage}>
                    {parseResult.diagnostics[0]?.message ?? "Invalid syntax"}
                  </p>
                </div>
              </div>
              <StylePane selectedView={undefined} />
            </section>
          </EditorSelectionContext.Provider>
        </EditorDispatchContext.Provider>
      );
    }

    if (parseResult.status === "missingAnnotations") {
      return (
        <EditorDispatchContext.Provider value={dispatch}>
          <EditorSelectionContext.Provider value={selectionContext}>
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
              <StylePane selectedView={undefined} />
            </section>
          </EditorSelectionContext.Provider>
        </EditorDispatchContext.Provider>
      );
    }

    return (
      <EditorDispatchContext.Provider value={dispatch}>
        <EditorSelectionContext.Provider value={selectionContext}>
          <section className={styles.editorShell} aria-label="Class diagram editor">
            <ToolPane />
            <div className={styles.canvasRegion}>
              {elementViews ? <ClassDiagram views={elementViews} /> : null}
            </div>
            <StylePane selectedView={selectedView} />
          </section>
        </EditorSelectionContext.Provider>
      </EditorDispatchContext.Provider>
    );
  }
);

export default AppController;
