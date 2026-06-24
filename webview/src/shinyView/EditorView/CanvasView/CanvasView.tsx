/**
 * @role [H+P] Hub plus presentational
 * @coordinates Ready editor selection and placement state across tools, canvas, and styles.
 * @presents Ready editor-state interface.
 */
import { useCallback, useReducer } from "react";
import type { ReactElement } from "react";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import { toClassDiagramView, toStylePaneView, toToolPaneView } from "./childViews";
import { EditorStateDispatchContext } from "./contexts";
import { editorStateReducer, initialEditorState } from "./state";
import type { EditorStateAction } from "./state";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import { useStateReconciliation } from "./useStateReconciliation";
import styles from "./CanvasView.module.css";
import type { CanvasViewModel } from "./views";

type CanvasViewProps = {
  readonly view: CanvasViewModel;
};

/**
 * Renders the ready class diagram editor interface.
 */
export default function CanvasView({ view }: CanvasViewProps): ReactElement {
  
  // @job logic:state:initialize
  const [editorState, dispatchEditorStateAction] = useReducer(
    editorStateReducer,
    initialEditorState
  );

  // @job logic:state:reconcile
  const reconcileSelectionWithElements = useCallback((elements: CanvasViewModel["elements"]) => {
    dispatchEditorStateAction({
      type: "selection.reconcileClassIds",
      elements,
    } satisfies EditorStateAction);
  }, []);
  useStateReconciliation(view, reconcileSelectionWithElements);

  // @job logic:child-view
  const toolPaneView = toToolPaneView(editorState);

  // @job logic:child-view
  const classDiagramView = toClassDiagramView(view, editorState);

  // @job logic:child-view
  const stylePaneView = toStylePaneView(view, editorState.selectedClassIds);

  // @job logic:state:transport
  return (
    <EditorStateDispatchContext.Provider value={dispatchEditorStateAction}>
      {/* @job render:layout */}
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
