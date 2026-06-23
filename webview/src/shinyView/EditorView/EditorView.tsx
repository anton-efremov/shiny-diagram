/**
 * @role [H+P] Hub plus presentational
 * @coordinates Editor shell branches across status, tools, canvas, and styles.
 * @logic Status-specific editor branch selection.
 * @presents Editor layout boundary.
 */
import { useEffect, useMemo, useReducer } from "react";
import type { ReactElement } from "react";
import type { EditorDispatch } from "../commands/editorCommand";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import type { ClassDiagramView } from "./ClassDiagram/views";
import { CommandDispatchProvider, EditorStateDispatchProvider } from "./contexts";
import { editorStateReducer, initialEditorState } from "./editorState";
import EditorStatus from "./EditorStatus/EditorStatus";
import type { EditorStatusView } from "./EditorStatus/views";
import type { StylePaneView } from "./StylePane/views";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import type { ToolPaneView } from "./ToolPane/views";
import type { EditorViewModel } from "./views";
import styles from "./EditorView.module.css";

type EditorViewProps = {
  view: EditorViewModel;
  dispatch: EditorDispatch;
};

/**
 * Renders the visual class-diagram editor shell.
 */
export default function EditorView({ view, dispatch }: EditorViewProps): ReactElement {
  const dispatchCommand = dispatch;

  // @job coordinate:shared-state
  const [editorState, dispatchEditorStateAction] = useReducer(
    editorStateReducer,
    initialEditorState
  );

  // @job coordinate:branch-views
  const elements = view.status === "invalidSyntax" ? null : view.elements;

  // @job logic:state
  useEffect(() => {
    dispatchEditorStateAction({
      type: "selection.reconcileClassIds",
      classIds: elements?.classes.map((classView) => classView.classId) ?? [],
    });
  }, [elements]);

  // @job coordinate:branch-views
  const selectedClassViews = useMemo(() => {
    const selected = new Set(editorState.selectedClassIds);
    return elements?.classes.filter((classView) => selected.has(classView.classId)) ?? [];
  }, [elements, editorState.selectedClassIds]);

  // @job coordinate:branch-views
  const statusView = toEditorStatusView(view);
  const toolPaneView: ToolPaneView = { placementMode: editorState.placementMode };
  const stylePaneView: StylePaneView = { selectedClassViews };

  // @job logic:ui-prop
  if (view.status === "invalidSyntax") {
    // @job render:layout
    return (
      <CommandDispatchProvider dispatchCommand={dispatchCommand}>
        <EditorStateDispatchProvider dispatchEditorStateAction={dispatchEditorStateAction}>
          <EditorStatus view={statusView} />
          <section className={styles.editorShell} aria-label="Class diagram editor">
            <ToolPane view={toolPaneView} />
            <div className={styles.canvasRegion}>
              <div className={styles.errorCanvas}>
                <p className={styles.errorMessage}>{view.message}</p>
              </div>
            </div>
            <StylePane view={stylePaneView} />
          </section>
        </EditorStateDispatchProvider>
      </CommandDispatchProvider>
    );
  }

  // @job logic:ui-prop
  if (view.status === "missingAnnotations") {
    // @job render:layout
    return (
      <CommandDispatchProvider dispatchCommand={dispatchCommand}>
        <EditorStateDispatchProvider dispatchEditorStateAction={dispatchEditorStateAction}>
          <EditorStatus view={statusView} />
          <section className={styles.editorShell} aria-label="Class diagram editor">
            <ToolPane view={toolPaneView} />
            <div className={styles.canvasRegion}>
              <div className={styles.missingCanvas}>
                <p className={styles.missingLabel}>Classes without spatial annotations:</p>
                <ul className={styles.missingList}>
                  {view.missingIds.map((id) => (
                    <li key={id} className={styles.missingItem}>
                      {id}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <StylePane view={stylePaneView} />
          </section>
        </EditorStateDispatchProvider>
      </CommandDispatchProvider>
    );
  }

  const classDiagramView: ClassDiagramView = {
    elements: view.elements,
    selectedClassIds: editorState.selectedClassIds,
    placementMode: editorState.placementMode,
  };

  // @job render:layout
  return (
    <CommandDispatchProvider dispatchCommand={dispatchCommand}>
      <EditorStateDispatchProvider dispatchEditorStateAction={dispatchEditorStateAction}>
        <EditorStatus view={statusView} />
        <section className={styles.editorShell} aria-label="Class diagram editor">
          <ToolPane view={toolPaneView} />
          <div className={styles.canvasRegion}>
            <ClassDiagram view={classDiagramView} />
          </div>
          <StylePane view={stylePaneView} />
        </section>
      </EditorStateDispatchProvider>
    </CommandDispatchProvider>
  );
}

function toEditorStatusView(view: EditorViewModel): EditorStatusView {
  switch (view.status) {
    case "ready":
      return { status: "ready" };
    case "invalidSyntax":
      return { status: "invalidSyntax", message: view.message };
    case "missingAnnotations":
      return { status: "missingAnnotations" };
  }
}
