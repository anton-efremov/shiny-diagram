/**
 * @role [L]+[P]
 * @logic Ready editor selection, placement state lifecycle, and child interaction routing.
 * @state selectionState: selected editor entities.
 * @state nodePlacementState: active node placement kind.
 * @presents Ready editor layout.
 */

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { NodePlacementState, SelectionState } from "../../state/editorStates";
import type { DiagramView } from "../../views/schema";
import ClassDiagram from "./DiagramCanvas/DiagramCanvas";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import { toInitialNodePlacementState, toInitialSelectionState } from "./state";
import { useInteractions } from "./useInteractions";
import { useStateReconciliation } from "./useStateReconciliation";
import styles from "./CanvasView.module.css";

type CanvasViewProps = {
  readonly view: DiagramView;
};

export default function CanvasView({ view }: CanvasViewProps): ReactElement {
  /** State: selected editor entities and active node placement kind */
  const [selectionState, setSelectionState] = useState<SelectionState>(() =>
    toInitialSelectionState()
  );
  const [nodePlacementState, setNodePlacementState] = useState<NodePlacementState>(() =>
    toInitialNodePlacementState()
  );

  /** State reconciliation: selected class IDs are repaired against the canonical diagram view */
  useStateReconciliation({ view, setSelectionState });

  /** Event handler derivation: state updates and class-delete shortcut transaction dispatch */
  const {
    onClassPlacementStart,
    onSelectionChange,
    onSelectionClear,
    onPlacementComplete,
    onClassDelete,
  } = useInteractions({ selectionState, setSelectionState, setNodePlacementState });

  /** Keystroke listenning: Delete selected classes */
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (shouldIgnoreClassDeleteEvent(event)) return;

      const wasHandled = onClassDelete();
      if (wasHandled) {
        event.preventDefault();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClassDelete]);

  return (
    <section className={styles.editorShell} aria-label="Class diagram editor">
      <ToolPane
        nodePlacementState={nodePlacementState}
        onClassPlacementStart={onClassPlacementStart}
      />
      <div className={styles.canvasRegion}>
        <ClassDiagram
          view={view}
          selectionState={selectionState}
          nodePlacementState={nodePlacementState}
          onSelectionChange={onSelectionChange}
          onSelectionClear={onSelectionClear}
          onPlacementComplete={onPlacementComplete}
        />
      </div>
      <StylePane view={view} selectionState={selectionState} />
    </section>
  );
}

function shouldIgnoreClassDeleteEvent(event: KeyboardEvent): boolean {
  return (
    event.defaultPrevented ||
    event.repeat ||
    event.key !== "Delete" ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isEditableTarget(event.target)
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
