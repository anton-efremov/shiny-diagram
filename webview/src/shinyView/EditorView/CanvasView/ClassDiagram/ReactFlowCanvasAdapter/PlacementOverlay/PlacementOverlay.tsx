/**
 * @role [L]+[P]
 * @logic Placement gesture state lifecycle.
 * @state origin: draw gesture anchor; draftRect: current placement outline.
 * @presents Placement interaction overlay and draft rectangle.
 */

import { useState } from "react";
import type { ReactElement, CSSProperties } from "react";
import type { NodePlacementState } from "../../../../../state/editorStates";
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
  /** State: draw gesture anchor and current placement outline */
  const [origin, setOrigin] = useState(() => toInitialOrigin());
  const [draftRect, setDraftRect] = useState(() => toInitialDraftRect());

  /** Child props derivation: draft rectangle becomes CSS positioning */
  const draftStyle: CSSProperties | undefined = toDraftStyle(draftRect);

  /** Event handler derivation: pointer gestures update draft state and dispatch class creation */
  const { onPointerDown, onPointerMove, onPointerUp } = useInteractions({
    origin,
    setOrigin,
    setDraftRect,
    onPlacementComplete,
  });

  /** Children routing decision */
  if (nodePlacementState !== "class") return null;

  /** Render return */
  return (
    <div
      className={styles.overlay}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {draftStyle ? <div className={styles.draftRect} style={draftStyle} /> : null}
    </div>
  );
}
