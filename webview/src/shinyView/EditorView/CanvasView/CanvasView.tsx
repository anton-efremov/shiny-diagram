/**
 * @role [L]+[P] Logic and Presentational
 * @logic Ready editor selection and placement state lifecycle.
 * @state editorState: selected class ids and active placement mode.
 * @presents Ready editor layout and context provision.
 */
import { useReducer, useEffect } from "react";
import type { ReactElement } from "react";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import { toClassDiagramView, toStylePaneView, toToolPaneView } from "./childViews";
import { EditorStateDispatchContext } from "./contexts";
import { editorStateReducer, initialEditorState } from "./state";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import styles from "./CanvasView.module.css";
import type { CanvasViewModel } from "./views";

type CanvasViewProps = {
  readonly view: CanvasViewModel;
};

export default function CanvasView({ view }: CanvasViewProps): ReactElement {
  // @job logic:state:initialize
  const [editorState, dispatchEditorStateAction] = useReducer(
    editorStateReducer,
    initialEditorState
  );

  // @job logic:state:reconcile
  useEffect(() => {
    dispatchEditorStateAction({
      type: "selection.reconcileClassIds",
      elements: view.elements,
    });
  }, [view.elements]);

  // @job logic:child:view
  const toolPaneView = toToolPaneView(editorState);
  const classDiagramView = toClassDiagramView(view, editorState);
  const stylePaneView = toStylePaneView(view, editorState.selectedClassIds);

  // @job connect:state:wire
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
