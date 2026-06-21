import type { ReactElement } from "react";
import type { CSSProperties } from "react";
import type { PlacementMode } from "../../../../contexts/canvasState";
import { usePlacementOverlayInteractions } from "./usePlacementOverlayInteractions";
import styles from "./PlacementOverlay.module.css";

type PlacementOverlayProps = {
  placementMode: PlacementMode | null;
};

/**
 * Renders the active placement interaction layer over the diagram viewport.
 */
export default function PlacementOverlay({
  placementMode,
}: PlacementOverlayProps): ReactElement | null {
  const { draftRect, onPointerDown, onPointerMove, onPointerUp } =
    usePlacementOverlayInteractions();

  if (!placementMode) return null;

  const draftStyle: CSSProperties | undefined = draftRect
    ? {
        left: draftRect.x,
        top: draftRect.y,
        width: draftRect.w,
        height: draftRect.h,
      }
    : undefined;

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
