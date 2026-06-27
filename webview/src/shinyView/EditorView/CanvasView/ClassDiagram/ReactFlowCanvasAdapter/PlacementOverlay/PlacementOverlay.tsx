/**
 * @role [L]+[P] Logic and Presentational
 * @logic Placement gesture state lifecycle.
 * @state origin: draw gesture anchor; draftRect: current placement outline.
 * @presents Placement interaction overlay and draft rectangle.
 */
import { useState } from "react";
import type { ReactElement, CSSProperties } from "react";
import { usePlacementOverlayInteractions } from "./useInteractions";
import type { DrawOrigin } from "./useInteractions";
import type { Rect } from "../../../../../../shared/geometry";
import type { NodePlacementState } from "../../../../../state/editorStates";
import styles from "./PlacementOverlay.module.css";

type PlacementOverlayProps = {
  readonly nodePlacementState: NodePlacementState;
};

export default function PlacementOverlay({
  nodePlacementState,
}: PlacementOverlayProps): ReactElement | null {
  // @job logic:state:initialize
  const [origin, setOrigin] = useState<DrawOrigin | null>(null);
  const [draftRect, setDraftRect] = useState<Rect | null>(null);

  // @job connect:state:wire
  const { onPointerDown, onPointerMove, onPointerUp } = usePlacementOverlayInteractions(
    origin,
    setOrigin,
    setDraftRect
  );

  // @job logic:child:route
  if (nodePlacementState !== "class") return null;

  // @job connect:child:view
  const draftStyle: CSSProperties | undefined = draftRect
    ? { left: draftRect.x, top: draftRect.y, width: draftRect.w, height: draftRect.h }
    : undefined;

  // @job render:structure
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
