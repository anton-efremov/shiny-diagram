/**
 * @behavior Ready editor selection, placement state lifecycle, and child interaction routing.
 * @render Ready editor layout.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { NodePlacementState, SelectionState } from "../../state/editorStates";
import type { DiagramView } from "../../views/schema";
import ClassDiagram from "./DiagramCanvas/DiagramCanvas";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import { toInitialNodePlacementState, toInitialSelectionState } from "./state";
import { useInteractions } from "./useInteractions";
import { useStateReconciliation } from "./useStateReconciliation";
import styles from "./EditorSurface.module.css";

type EditorSurfaceProps = {
  readonly view: DiagramView;
};

export default function EditorSurface({ view }: EditorSurfaceProps): ReactElement {
  // State creation: ledger states - selected editor entities and active node placement kind
  const [selectionState, setSelectionState] = useState<SelectionState>(() =>
    toInitialSelectionState()
  );
  const [nodePlacementState, setNodePlacementState] = useState<NodePlacementState>(() =>
    toInitialNodePlacementState()
  );

  // State reconciliation
  useStateReconciliation({ view, setSelectionState });

  // Event handler props derivation
  const {
    onClassPlacementStart,
    onRelationshipPlacementStart,
    onClassSelect,
    onClassMoved,
    onRelationshipConnect,
    onRelationshipReconnect,
    onRelationshipSelect,
    onRelationshipDuplicate,
    onStyleSelect,
    onBackgroundClick,
    onConnectAborted,
    onPlacementComplete,
  } = useInteractions({
    relationships: view.relationships,
    nodePlacementState,
    setSelectionState,
    setNodePlacementState,
  });

  return (
    <section className={styles.editorShell} aria-label="Class diagram editor">
      <ToolPane
        nodePlacementState={nodePlacementState}
        onClassPlacementStart={onClassPlacementStart}
        onRelationshipPlacementStart={onRelationshipPlacementStart}
      />
      <div className={styles.canvasRegion}>
        <ClassDiagram
          view={view}
          selectionState={selectionState}
          nodePlacementState={nodePlacementState}
          onClassSelect={onClassSelect}
          onClassMoved={onClassMoved}
          onRelationshipConnect={onRelationshipConnect}
          onRelationshipReconnect={onRelationshipReconnect}
          onRelationshipSelect={onRelationshipSelect}
          onBackgroundClick={onBackgroundClick}
          onConnectAborted={onConnectAborted}
          onPlacementComplete={onPlacementComplete}
        />
      </div>
      <StylePane
        view={view}
        selectionState={selectionState}
        onStyleSelect={onStyleSelect}
        onRelationshipSelect={onRelationshipSelect}
        onRelationshipDuplicate={onRelationshipDuplicate}
      />
    </section>
  );
}
