/**
 * @behavior Placement gesture state lifecycle and active placement routing.
 * @render Placement interaction overlay and draft rectangle.
 * @framework Translates internal React Flow coordinates into diagram coordinates.
 */

import { useState } from "react";
import type { ReactElement, CSSProperties } from "react";
import type { NodePlacementState } from "../../../../../../state/editorStates";
import { PLACEMENT_OVERLAY_Z_INDEX } from "../../../../../../config/editorUiConfig";
import { toDraftStyle } from "./childProps";
import { toInitialDraftRect, toInitialOrigin } from "./state";
import { useInteractions } from "./useInteractions";
import styles from "./PlacementOverlay.module.css";

type PlacementOverlayProps = {
  readonly nodePlacementState: NodePlacementState;
  readonly onPlacementComplete: () => void;
};

export default function PlacementOverlay({
  nodePlacementState,
  onPlacementComplete,
}: PlacementOverlayProps): ReactElement | null {
  // State creation: local states - draw gesture anchor and current placement outline
  const [origin, setOrigin] = useState(() => toInitialOrigin());
  const [draftRect, setDraftRect] = useState(() => toInitialDraftRect());

  // UI props derivation
  const overlayStyle: CSSProperties = { zIndex: PLACEMENT_OVERLAY_Z_INDEX };
  const draftStyle: CSSProperties | undefined = toDraftStyle(draftRect);

  // Event handler props derivation
  const { onPointerDown, onPointerMove, onPointerUp } = useInteractions({
    origin,
    setOrigin,
    setDraftRect,
    onPlacementComplete,
  });

  // Child component routing
  if (nodePlacementState?.kind !== "class") return null;

  return (
    <div
      className={styles.overlay}
      style={overlayStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {draftStyle ? <div className={styles.draftRect} style={draftStyle} /> : null}
    </div>
  );
}
