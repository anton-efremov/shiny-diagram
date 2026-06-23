import type { ReactElement } from "react";
import type { CSSProperties } from "react";
import { useEditorPlacementModeState } from "../../contexts";
import { usePlacementOverlayInteractions } from "./usePlacementOverlayInteractions";
import styles from "./PlacementOverlay.module.css";

/**
 * Renders the active placement interaction layer over the diagram viewport.
 */
export default function PlacementOverlay(): ReactElement | null {
  const { placementMode } = useEditorPlacementModeState();
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
