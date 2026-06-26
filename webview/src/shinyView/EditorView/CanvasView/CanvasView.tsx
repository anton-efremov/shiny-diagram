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
import { toClassDeleteTransaction } from "./commands";
import { EditorStateDispatchContext } from "./contexts";
import { editorStateReducer, initialEditorState } from "./state";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import { useDispatchCommand } from "../contexts";
import styles from "./CanvasView.module.css";
import type { CanvasViewModel } from "./views";

type CanvasViewProps = {
  readonly view: CanvasViewModel;
};

export default function CanvasView({ view }: CanvasViewProps): ReactElement {
  const dispatchCommand = useDispatchCommand();

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

  // @job connect:event:wire
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      // @job connect:event:normalize
      if (
        editorState.selectedClassIds.length === 0 ||
        event.defaultPrevented ||
        event.repeat ||
        event.key !== "Delete" ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      const transaction = toClassDeleteTransaction(editorState.selectedClassIds);
      if (!transaction) return;

      event.preventDefault();
      dispatchCommand(transaction);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editorState.selectedClassIds, dispatchCommand]);

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

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") return true;

  return (
    (target instanceof HTMLElement && target.isContentEditable) ||
    target.closest("[contenteditable]:not([contenteditable='false'])") !== null
  );
}
