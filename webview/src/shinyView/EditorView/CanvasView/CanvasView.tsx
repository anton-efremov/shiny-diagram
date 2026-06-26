/**
 * @role [L]+[P] Logic and Presentational
 * @logic Ready editor selection and placement state lifecycle.
 * @state selectionState: selected editor entities.
 * @state nodePlacementState: active node placement kind.
 * @presents Ready editor layout and context provision.
 */
import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import ClassDiagram from "./ClassDiagram/ClassDiagram";
import { toClassDiagramView, toStylePaneView, toToolPaneView } from "./childViews";
import { toClassDeleteTransaction } from "./commands";
import { CanvasViewStateDispatchContext } from "./contexts";
import {
  canHandleClassSelectionShortcut,
  initialNodePlacementState,
  initialSelectionState,
  reconcileSelectionStateWithElements,
  updateNodePlacementState,
  updateSelectedClassIds,
} from "./state";
import type { CanvasViewStateAction } from "./state";
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
  const [selectionState, setSelectionState] = useState(initialSelectionState);
  // @job logic:state:initialize
  const [nodePlacementState, setNodePlacementState] = useState(initialNodePlacementState);

  // @job logic:state:update
  const dispatchCanvasViewStateAction = useCallback((action: CanvasViewStateAction) => {
    switch (action.type) {
      case "selection.setClassIds":
        setSelectionState((state) => updateSelectedClassIds(state, action.classIds));
        return;
      case "selection.clearClassIds":
        setSelectionState((state) => updateSelectedClassIds(state, []));
        return;
      case "selection.reconcileClassIds":
        setSelectionState((state) => reconcileSelectionStateWithElements(state, action.elements));
        return;
      case "placement.setMode":
        setNodePlacementState((state) =>
          updateNodePlacementState(state, action.nodePlacementState)
        );
        return;
      case "placement.complete":
      case "placement.cancel":
        setNodePlacementState((state) => updateNodePlacementState(state, null));
        return;
    }
  }, []);

  // @job logic:state:reconcile
  useEffect(() => {
    dispatchCanvasViewStateAction({
      type: "selection.reconcileClassIds",
      elements: view.elements,
    });
  }, [view.elements, dispatchCanvasViewStateAction]);

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

  // @job logic:child:view
  const toolPaneView = toToolPaneView(nodePlacementState);
  const classDiagramView = toClassDiagramView(view, selectionState, nodePlacementState);
  const stylePaneView = toStylePaneView(view, selectionState);

  // @job connect:state:wire
  return (
    <CanvasViewStateDispatchContext.Provider value={dispatchCanvasViewStateAction}>
      <section className={styles.editorShell} aria-label="Class diagram editor">
        <ToolPane view={toolPaneView} />
        <div className={styles.canvasRegion}>
          <ClassDiagram view={classDiagramView} />
        </div>
        <StylePane view={stylePaneView} />
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
