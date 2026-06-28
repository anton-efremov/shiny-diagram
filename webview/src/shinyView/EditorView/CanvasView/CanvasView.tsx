/**
 * @role [L]+[P] Logic and Presentational
 * @logic Ready editor selection and placement state lifecycle.
 * @state selectionState: selected editor entities.
 * @state nodePlacementState: active node placement kind.
 * @presents Ready editor layout and context provision.
 */
import { useEffect, useReducer } from "react";
import type { ReactElement } from "react";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import { toClassDeleteTransaction } from "./transactions";
import { CanvasViewStateDispatchContext } from "./contexts";
import {
  canHandleClassSelectionShortcut,
  canvasViewReducer,
  initialCanvasViewState,
} from "./state";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import { useDispatchTransaction } from "../contexts";
import styles from "./CanvasView.module.css";
import type { DiagramView } from "../../views/schema";

type CanvasViewProps = {
  readonly view: DiagramView;
};

export default function CanvasView({ view }: CanvasViewProps): ReactElement {
  const dispatchCommand = useDispatchTransaction();

  // @job logic:state:initialize
  const [state, dispatchCanvasViewStateAction] = useReducer(
    canvasViewReducer,
    initialCanvasViewState
  );
  const { selectionState, nodePlacementState } = state;

  // @job logic:state:reconcile
  useEffect(() => {
    dispatchCanvasViewStateAction({
      type: "selection.reconcileClassIds",
      diagram: view,
    });
  }, [view, dispatchCanvasViewStateAction]);

  // @job connect:event:wire
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      // @job connect:event:normalize
      if (
        !canHandleClassSelectionShortcut(selectionState) ||
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

      const transaction = toClassDeleteTransaction(selectionState.classIds);
      if (!transaction) return;

      event.preventDefault();
      dispatchCommand(transaction);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectionState, dispatchCommand]);

  // @job connect:state:wire
  return (
    <CanvasViewStateDispatchContext.Provider value={dispatchCanvasViewStateAction}>
      <section className={styles.editorShell} aria-label="Class diagram editor">
        <ToolPane nodePlacementState={nodePlacementState} />
        <div className={styles.canvasRegion}>
          <ClassDiagram
            view={view}
            selectionState={selectionState}
            nodePlacementState={nodePlacementState}
          />
        </div>
        <StylePane view={view} selectionState={selectionState} />
      </section>
    </CanvasViewStateDispatchContext.Provider>
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
