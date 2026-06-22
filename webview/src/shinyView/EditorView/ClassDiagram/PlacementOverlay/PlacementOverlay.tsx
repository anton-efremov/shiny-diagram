import type { ReactElement } from "react";
import type { CSSProperties } from "react";
import type { EditorDispatch } from "../../../commands/editorCommand";
import type { PlacementMode } from "../../placementMode";
import { usePlacementOverlayInteractions } from "./usePlacementOverlayInteractions";
import styles from "./PlacementOverlay.module.css";

type PlacementOverlayProps = {
  placementMode: PlacementMode | null;
  dispatch: EditorDispatch;
  onPlacementModeChange: (placementMode: PlacementMode | null) => void;
};

/**
 * Renders the active placement interaction layer over the diagram viewport.
 */
export default function PlacementOverlay({
  placementMode,
  dispatch,
  onPlacementModeChange,
}: PlacementOverlayProps): ReactElement | null {
  const { draftRect, onPointerDown, onPointerMove, onPointerUp } = usePlacementOverlayInteractions(
    dispatch,
    () => onPlacementModeChange(null)
  );

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
