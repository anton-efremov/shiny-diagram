/**
 * @role [H+P] Hub plus presentational
 * @coordinates Ready editor selection and placement state across tools, canvas, and styles.
 * @presents Ready editor-state interface.
 */
import { useEffect, useReducer } from "react";
import type { ReactElement } from "react";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import { toClassDiagramView, toStylePaneView, toToolPaneView } from "./childViews";
import { EditorStateDispatchContext } from "./contexts";
import { editorStateReducer, initialEditorState } from "./editorState";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import styles from "./CanvasView.module.css";
import type { CanvasViewModel } from "./views";

type CanvasViewProps = {
  readonly view: CanvasViewModel;
};

/**
 * Renders the ready class diagram editor interface.
 */
export default function CanvasView({ view }: CanvasViewProps): ReactElement {
  // @job coordinate:shared-state
  const [editorState, dispatchEditorStateAction] = useReducer(
    editorStateReducer,
    initialEditorState
  );

  // @job logic:state-reconciliation
  useEffect(() => {
    dispatchEditorStateAction({
      type: "selection.reconcileClassIds",
      elements: view.elements,
    });
  }, [view.elements]);

  // @job logic:child-view
  const toolPaneView = toToolPaneView(editorState);

  // @job logic:child-view
  const classDiagramView = toClassDiagramView(view, editorState);

  // @job logic:child-view
  const stylePaneView = toStylePaneView(view, editorState.selectedClassIds);

  // @job render:layout
  return (
    <EditorStateDispatchContext.Provider value={dispatchEditorStateAction}>
      <section className={styles.editorShell} aria-label="Class diagram editor">
        <ToolPane view={toolPaneView} />
        <div className={styles.canvasRegion}>
          <ClassDiagram view={classDiagramView} />
        </div>
        <StylePane view={stylePaneView} />
      </section>
    </EditorStateDispatchContext.Provider>
  );
}
