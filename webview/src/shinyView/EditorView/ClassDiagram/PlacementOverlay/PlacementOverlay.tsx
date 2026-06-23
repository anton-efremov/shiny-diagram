/**
 * @role [L+P] Logic plus presentational
 * @logic Placement overlay visibility and draft rectangle projection.
 * @presents Class placement draw overlay.
 */
import type { ReactElement } from "react";
import type { CSSProperties } from "react";
import { usePlacementOverlayInteractions } from "./usePlacementOverlayInteractions";
import type { PlacementOverlayView } from "./views";
import styles from "./PlacementOverlay.module.css";

type PlacementOverlayProps = {
  readonly view: PlacementOverlayView;
};

/**
 * Renders the active placement interaction layer over the diagram viewport.
 */
export default function PlacementOverlay({ view }: PlacementOverlayProps): ReactElement | null {
  // @job wire:command
  const { draftRect, onPointerDown, onPointerMove, onPointerUp } =
    usePlacementOverlayInteractions();

  // @job logic:ui-prop
  if (!view.placementMode) return null;

  // @job adapt:presentation-shape
  const draftStyle: CSSProperties | undefined = draftRect
    ? {
        left: draftRect.x,
        top: draftRect.y,
        width: draftRect.w,
        height: draftRect.h,
      }
    : undefined;

  // @job render:ui
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
